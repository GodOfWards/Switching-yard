#!/usr/bin/env python3
"""Rail network from OpenStreetMap: the lines out of a station to their next junction.

Research tool for #52, not part of the game. Reads an OSM extract (.osm.pbf),
keeps the network-level track (railway=rail or railway=disused, without a
`service` tag, not tourism), and walks every line out of the start station
until it meets a real junction or ends. Writes GeoJSON, a summary table and a
map picture. The method is in docs/reference/rail-network-junin.md.

Needs: pip install osmium matplotlib

  python3 tools/rail_network.py extract argentina.osm.pbf network.json
  python3 tools/rail_network.py walk network.json out/        # Junín by default
"""
import argparse, collections, json, math, os, sys

START = {"name": "Junín", "lon": -60.9498, "lat": -34.5842}
BOX_DEG = (3.0, 2.5)        # half-width, half-height of the box kept by `extract`
STATION_AREA_M = 3000       # track inside this radius of the start is the station itself
BRANCH_SEARCH_M = 20000     # how far along the track a branch is followed when judging a junction
BRANCH_MIN_M = 5000         # a branch reaching less far than this is a spur, not a line
STATION_SNAP_M = 400        # a station node this close to a line is on it
SIMPLIFY_M = 50             # Douglas-Peucker tolerance for the size estimate
KEEP = ("rail", "disused")
STATION_TAGS = ("station", "halt")


def metres(a, b, lat0=START["lat"]):
    kx = 111320 * math.cos(math.radians(lat0))
    return math.hypot((a[0] - b[0]) * kx, (a[1] - b[1]) * 110540)


# ---------------------------------------------------------------- extract

def extract(pbf, out):
    import osmium
    x0, y0 = START["lon"] - BOX_DEG[0], START["lat"] - BOX_DEG[1]
    x1, y1 = START["lon"] + BOX_DEG[0], START["lat"] + BOX_DEG[1]
    inside = lambda lo, la: x0 <= lo <= x1 and y0 <= la <= y1
    ways, stations = [], []

    class H(osmium.SimpleHandler):
        def way(self, w):
            t = w.tags
            if t.get("railway") not in KEEP or "service" in t or t.get("usage") == "tourism":
                return
            try:
                pts = [(n.ref, n.lon, n.lat) for n in w.nodes]
            except osmium.InvalidLocationError:
                return
            if any(inside(lo, la) for _, lo, la in pts):
                ways.append({"id": w.id, "tags": dict(t), "nodes": pts})

        def node(self, n):
            t = n.tags
            old = t.get("disused:railway") or t.get("abandoned:railway") or (
                "station" if t.get("historic") == "railway_station" else None)
            if (t.get("railway") in STATION_TAGS or old in STATION_TAGS) and inside(n.location.lon, n.location.lat):
                stations.append({"id": n.id, "tags": dict(n.tags),
                                 "lon": n.location.lon, "lat": n.location.lat})

    H().apply_file(pbf, locations=True, idx="flex_mem")
    json.dump({"box": [x0, y0, x1, y1], "ways": ways, "stations": stations}, open(out, "w"))
    print(f"{len(ways)} ways, {len(stations)} stations -> {out}")


# ---------------------------------------------------------------- graph

class Graph:
    def __init__(self, data):
        self.pos, self.adj, self.edge = {}, collections.defaultdict(set), {}
        for w in data["ways"]:
            nodes = w["nodes"]
            for ref, lo, la in nodes:
                self.pos[ref] = (lo, la)
            for (a, *_), (b, *_) in zip(nodes, nodes[1:]):
                if a == b:
                    continue
                self.adj[a].add(b); self.adj[b].add(a)
                self.edge[frozenset((a, b))] = w
        self.stations = data["stations"]

    def length(self, a, b):
        return metres(self.pos[a], self.pos[b])

    def reach(self, start, first, blocked, limit):
        """Nodes reachable from `start` through `first` without entering `blocked`,
        up to `limit` metres of track; returns (nodes, furthest straight-line metres)."""
        dist = {first: self.length(start, first)}
        todo, seen, far = [first], {first}, 0.0
        while todo:
            n = todo.pop()
            far = max(far, metres(self.pos[n], self.pos[start]))
            for m in self.adj[n]:
                if m in blocked or m in seen:
                    continue
                d = dist[n] + self.length(n, m)
                if d <= limit:
                    dist[m] = d; seen.add(m); todo.append(m)
        return seen, far

    def groups(self, node, firsts, blocked):
        """Branches from `node` merged where they meet again: [(firsts, far)]."""
        found = [([f], *self.reach(node, f, blocked | {node}, BRANCH_SEARCH_M)) for f in firsts]
        merged = True
        while merged:
            merged = False
            for i in range(len(found)):
                for j in range(i + 1, len(found)):
                    if found[i][1] & found[j][1]:
                        a, b = found[i], found.pop(j)
                        found[i] = (a[0] + b[0], a[1] | b[1], max(a[2], b[2]))
                        merged = True
                        break
                if merged:
                    break
        return found


def walk_line(g, prev, cur, area):
    """Follow a line from prev->cur until a real junction or its end."""
    path, seen = [prev, cur], {prev, cur} | area
    while True:
        nxt = [m for m in g.adj[cur] if m != prev]
        if not nxt:
            return path, "end"
        if len(nxt) == 1:
            if nxt[0] in seen:
                return path, "loop"
            prev, cur = cur, nxt[0]
        else:
            # A branch that leads back into the start station is the way we came.
            gs = [(f, far) for f, nodes, far in g.groups(cur, [prev] + nxt, set())
                  if prev in f or not nodes & area]
            incoming = next(i for i, (f, _) in enumerate(gs) if prev in f)
            lines = [i for i, (f, far) in enumerate(gs) if i != incoming and far >= BRANCH_MIN_M]
            if len(lines) >= 2:
                return path, "junction"
            onward = [i for i in range(len(gs)) if i != incoming]
            if not onward:
                return path, "loop"
            best = max(onward, key=lambda i: gs[i][1])
            same = g.edge[frozenset((prev, cur))]["tags"].get("ref")
            options = [m for m in gs[best][0] if m in nxt and m not in seen]
            if not options:
                return path, "loop"
            options.sort(key=lambda m: g.edge[frozenset((cur, m))]["tags"].get("ref") != same)
            prev, cur = cur, options[0]
        path.append(cur); seen.add(cur)


def off_line(p, pts):
    """(index of the nearest segment, metres) from point p to the polyline pts."""
    kx = 111320 * math.cos(math.radians(START["lat"]))
    px, py = p[0] * kx, p[1] * 110540
    best = (0, float("inf"))
    for k, ((ax, ay), (bx, by)) in enumerate(zip(pts, pts[1:])):
        ax, ay, bx, by = ax * kx, ay * 110540, bx * kx, by * 110540
        L = (bx - ax) ** 2 + (by - ay) ** 2 or 1e-9
        t = max(0, min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / L))
        d = math.hypot(px - ax - t * (bx - ax), py - ay - t * (by - ay))
        if d < best[1]:
            best = (k, d)
    return best


def nearest_station(g, p):
    best = min(g.stations, key=lambda s: metres((s["lon"], s["lat"]), p))
    d = metres((best["lon"], best["lat"]), p)
    name = best["tags"].get("name", "?")
    return name if d < 1000 else f"{d / 1000:.0f} km from {name}"


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    kx = 111320 * math.cos(math.radians(START["lat"]))
    ax, ay, bx, by = a[0] * kx, a[1] * 110540, b[0] * kx, b[1] * 110540
    L = math.hypot(bx - ax, by - ay) or 1e-9
    d = [abs((bx - ax) * (ay - p[1] * 110540) - (ax - p[0] * kx) * (by - ay)) / L for p in pts]
    i = max(range(1, len(pts) - 1), key=lambda k: d[k])
    if d[i] <= tol:
        return [a, b]
    return simplify(pts[: i + 1], tol)[:-1] + simplify(pts[i:], tol)


def walk(src, outdir):
    sys.setrecursionlimit(100000)
    data = json.load(open(src))
    g = Graph(data)
    origin = (START["lon"], START["lat"])
    area = {n for n in g.adj if metres(g.pos[n], origin) <= STATION_AREA_M}
    exits = [(a, b) for a in area for b in g.adj[a] if b not in area]
    # Exits that meet again outside the station are one line (double track, loops).
    used, lines = set(), []
    for a, b in exits:
        if (a, b) in used:
            continue
        nodes, far = g.reach(a, b, area, BRANCH_SEARCH_M)
        same = [(c, d) for c, d in exits if d in nodes]
        used.update(same)
        if far < BRANCH_MIN_M:
            continue
        lines.append(walk_line(g, a, b, area))
    # Two exits that run side by side and meet beyond the station are one line:
    # keep the one with the most track in use.
    def in_use(path):
        return sum(g.length(p, q) for p, q in zip(path, path[1:])
                   if g.edge[frozenset((p, q))]["tags"]["railway"] == "rail")
    kept = []
    for path, how in sorted(lines, key=lambda l: -in_use(l[0])):
        if not any(set(path[2:]) & set(k[2:]) for k, _ in kept):
            kept.append((path, how))
    lines = [(path, how, START["name"]) for path, how in kept]

    feats, rows = [], []
    for path, how, start in lines:
        pts = [g.pos[n] for n in path]
        segs = [g.edge[frozenset((p, q))] for p, q in zip(path, path[1:])]
        by = collections.Counter()
        for (p, q), w in zip(zip(path, path[1:]), segs):
            by[w["tags"]["railway"]] += g.length(p, q)
        names = collections.Counter()
        for (p, q), w in zip(zip(path, path[1:]), segs):
            t = w["tags"]
            names[(t.get("ref") or t.get("disused:ref") or "", t.get("name") or t.get("disused:name") or "")] += g.length(p, q)
        (ref, name), _ = names.most_common(1)[0]
        gauges = {w["tags"].get("gauge") for w in segs} - {None}
        on = []
        for s in g.stations:
            sp = (s["lon"], s["lat"])
            k, d = off_line(sp, pts)
            if metres(sp, origin) > STATION_AREA_M and d <= STATION_SNAP_M:
                on.append((k, metres(pts[0], sp), s["tags"].get("name")))
        on = [name for *_, name in sorted(on)]
        end = pts[-1]
        end_name = nearest_station(g, end)
        total = sum(by.values())
        kept = simplify(pts, SIMPLIFY_M)
        rows.append({"from": start, "ref": ref, "name": name, "km": round(total / 1000, 1),
                     "rail_km": round(by["rail"] / 1000, 1), "disused_km": round(by["disused"] / 1000, 1),
                     "gauge": "/".join(sorted(gauges)), "ends": how, "end_name": end_name,
                     "end": [round(end[0], 5), round(end[1], 5)], "stations": len(on),
                     "osm_points": len(pts), "points_at_50m": len(kept)})
        feats.append({"type": "Feature", "properties": dict(rows[-1], station_names=on),
                      "geometry": {"type": "LineString", "coordinates": [[round(x, 6), round(y, 6)] for x, y in pts]}})

    os.makedirs(outdir, exist_ok=True)
    json.dump({"type": "FeatureCollection", "features": feats},
              open(os.path.join(outdir, "lines.geojson"), "w"), ensure_ascii=False)
    for r in sorted(rows, key=lambda r: -r["km"]):
        print(json.dumps(r, ensure_ascii=False))
    picture(g, feats, data["box"], os.path.join(outdir, "lines.png"))


def picture(g, feats, box, out):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, ax = plt.subplots(figsize=(9, 8), dpi=110)
    for key, w in g.edge.items():
        a, b = tuple(key)
        style = "-" if w["tags"]["railway"] == "rail" else ":"
        ax.plot([g.pos[a][0], g.pos[b][0]], [g.pos[a][1], g.pos[b][1]], style, color="#bbb", lw=0.6)
    colors = plt.get_cmap("tab10")
    for i, f in enumerate(feats):
        xs, ys = zip(*f["geometry"]["coordinates"])
        p = f["properties"]
        ax.plot(xs, ys, color=colors(i % 10), lw=2.2, label=f'{p["ref"] or "—"} {p["name"]} · {p["from"]} → {p["end_name"]} · {p["km"]} km')
        ax.plot(xs[-1], ys[-1], "o", color=colors(i % 10))
        ax.annotate(p["end_name"], (xs[-1], ys[-1]), fontsize=8, xytext=(4, 4), textcoords="offset points")
    ax.plot(START["lon"], START["lat"], "s", color="k")
    ax.annotate(START["name"], (START["lon"], START["lat"]), fontsize=10, weight="bold", xytext=(5, -12), textcoords="offset points")
    ax.set_aspect(1 / math.cos(math.radians(START["lat"])))
    xs = [x for f in feats for x, _ in f["geometry"]["coordinates"]]
    ys = [y for f in feats for _, y in f["geometry"]["coordinates"]]
    ax.set_xlim(min(xs) - 0.3, max(xs) + 0.3); ax.set_ylim(min(ys) - 0.3, max(ys) + 0.3)
    ax.legend(loc="lower left", fontsize=7)
    ax.set_title("Lines out of Junín to their next junction · OSM rail (solid) and disused (dotted)\n© OpenStreetMap contributors, ODbL", fontsize=9)
    fig.tight_layout(); fig.savefig(out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    e = sub.add_parser("extract"); e.add_argument("pbf"); e.add_argument("out")
    w = sub.add_parser("walk"); w.add_argument("network"); w.add_argument("outdir")
    a = ap.parse_args()
    extract(a.pbf, a.out) if a.cmd == "extract" else walk(a.network, a.outdir)

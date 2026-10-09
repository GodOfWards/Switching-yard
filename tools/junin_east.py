#!/usr/bin/env python3
"""Junín's east end as game track: WORLD DATA's NODES, SEGMENTS, SWITCHES and MAP_EDGES.

Content tool for #44, not part of the game. Reads the saved OpenStreetMap
export of Junín yard and prints JavaScript to paste into WORLD DATA in
index.html, replacing everything from `const NODES` to the end of
`const MAP_EDGES`. The method is in docs/reference/junin-yard.md.

Needs only the standard library.

  python3 tools/junin_east.py junin-2026-10-08.osm > east.js
"""
import collections, math, sys
import xml.etree.ElementTree as ET

# The frame: turned so the main line runs along x, eastward; y is to its right.
ORIGIN = (-60.95, -34.585)  # lon, lat the projection is measured from
ALPHA = math.radians(20.6)  # the main line's bearing, north of east
X_WEST, X_EAST = 580, 1380  # m along the main line where the yard tracks and the lead are cut off
MAIN_WEST, MAIN_EAST = 570, 2380  # m along the main line where it leaves the map; retunable
OFFSET = (580, -80)         # frame point that becomes the game's (0, 0): yard track 1's cut end

# What is laid. The slice is everything joined to the ladder's first switch
# between the two cuts, less the rest of the east throat and the through
# track; the main line is laid between its own cuts. The lead follows OSM's
# track that carries the crossover to the main.
ROOT = "12107781967"                                  # the ladder's first switch, on the lead
LEFT_OUT_WAYS = {"1000697115", "1000697116", "1000697117", "1181520561"}
CROSSOVER = {"3892462373": "X1", "3892462372": "X2"}  # its switches: X1 on the lead, X2 on the main
TURNTABLE_END = "1300539013"
STUBS = {"12107781968": "stub1", "12107781962": "stub2"}

# How it is laid. Judgment calls, retunable.
SIMPLIFY = 0.75             # m, Douglas-Peucker tolerance on OSM's lines
TURNOUT_RADIUS = 190        # m, the curve a track leaves its switch on; tightened where switches stand close
MAX_RADIUS = 300            # m, the widest curve fitted at one of OSM's corners
MIN_SWITCH_GAP = 25         # m; a switch closer than this to the one before is moved out to it
NEAR_SWITCHES = 60          # m; two switches closer than this are joined by two curves, nothing between
SLIVER = 0.3                # m; a piece shorter than this is merged into its neighbour
DIRECTION_SAMPLE = 15       # m along each track at which a switch's directions are read


def unit(v): l = math.hypot(*v); return (v[0] / l, v[1] / l)
def sub(a, b): return (a[0] - b[0], a[1] - b[1])
def add(a, b, s=1): return (a[0] + b[0] * s, a[1] + b[1] * s)
def dot(a, b): return a[0] * b[0] + a[1] * b[1]
def cross(a, b): return a[0] * b[1] - a[1] * b[0]
def perp(v): return (-v[1], v[0])
def neg(v): return (-v[0], -v[1])


def project(lon, lat):
    e = (lon - ORIGIN[0]) * 111320 * math.cos(math.radians(ORIGIN[1]))
    n = (lat - ORIGIN[1]) * 110540
    return (e * math.cos(ALPHA) + n * math.sin(ALPHA), e * math.sin(ALPHA) - n * math.cos(ALPHA))


def along(pts, d):
    for a, b in zip(pts, pts[1:]):
        l = math.dist(a, b)
        if d <= l: return add(a, unit(sub(b, a)), d)
        d -= l
    return pts[-1]


def simplify(pts, tol):
    if len(pts) < 3: return pts
    a, b = pts[0], pts[-1]
    u = unit(sub(b, a)) if math.dist(a, b) > 1e-9 else (1, 0)
    i = max(range(1, len(pts) - 1), key=lambda i: abs(cross(u, sub(pts[i], a))))
    if abs(cross(u, sub(pts[i], a))) <= tol: return [a, b]
    return simplify(pts[:i + 1], tol)[:-1] + simplify(pts[i:], tol)


def read(path):
    root = ET.parse(path).getroot()
    P = {n.get("id"): project(float(n.get("lon")), float(n.get("lat"))) for n in root.iter("node")}
    adj, main = collections.defaultdict(set), set()
    for w in root.iter("way"):
        tags = {t.get("k"): t.get("v") for t in w.iter("tag")}
        nds = [nd.get("ref") for nd in w.iter("nd")]
        if tags.get("railway") != "rail" or w.get("id") in LEFT_OUT_WAYS: continue
        for a, b in zip(nds, nds[1:]):
            adj[a].add(b); adj[b].add(a)
            if tags.get("usage") == "main": main.add(frozenset((a, b)))
    return P, adj, main


def slice_graph(P, adj, main):
    """Track joined to ROOT between the cuts; a track crossing a cut ends there.
    Also returns the main line's two cut ends, west first."""
    G, seen, todo, main_ends = collections.defaultdict(set), {ROOT}, [ROOT], []
    while todo:
        n = todo.pop()
        for m in sorted(adj[n]):
            x = P[m][0]
            on_main = frozenset((n, m)) in main
            lo, hi = (MAIN_WEST, MAIN_EAST) if on_main else (X_WEST, X_EAST)
            if not lo <= x <= hi:
                X = lo if x < lo else hi
                a, b = P[n], P[m]; f = (X - a[0]) / (b[0] - a[0])
                cut = "cut" + m; P[cut] = (X, a[1] + (b[1] - a[1]) * f)
                G[n].add(cut); G[cut].add(n)
                if on_main: main_ends.append(cut)
                continue
            G[n].add(m); G[m].add(n)
            if m not in seen: seen.add(m); todo.append(m)
    return G, sorted(main_ends, key=lambda c: P[c][0])


def chains(G):
    """Every run of track between switches and ends, as a list of node ids."""
    key = sorted(n for n in G if len(G[n]) != 2)
    out, done = [], set()
    for k in key:
        for m in sorted(G[k]):
            if (k, m) in done: continue
            ch = [k, m]
            while len(G[ch[-1]]) == 2: ch.append(next(z for z in G[ch[-1]] if z != ch[-2]))
            done.add((k, m)); done.add((ch[-1], ch[-2])); out.append(ch)
    return key, out


def switches(G, P, key, edges):
    """Each switch's trunk, legs, straight leg and direction T (from the legs toward the trunk)."""
    sw = {}
    for k in key:
        if len(G[k]) != 3: continue
        es = [e for e in edges if e[0] == k] + [e[::-1] for e in edges if e[-1] == k and e[0] != k]
        d = [unit(sub(along([P[n] for n in e], DIRECTION_SAMPLE), P[k])) for e in es]
        score = [sum(dot(d[i], d[j]) for j in range(3) if j != i) for i in range(3)]
        ti = min(range(3), key=lambda i: score[i])
        legs = [i for i in range(3) if i != ti]
        straight = min(legs, key=lambda i: dot(d[i], d[ti]))
        sw[k] = dict(T=unit(sub(d[ti], d[straight])), trunk=es[ti][1],
                     legs=[es[i][1] for i in legs], straight=es[straight][1])
    return sw


def lay(P, sw, edges, order):
    """Pieces of track (edge index, a, b, r), straight when r is 0."""
    def into(node, nxt):        # direction a track leaves a switch in
        return sw[node]["T"] if nxt == sw[node]["trunk"] else neg(sw[node]["T"])

    # Switches standing close: the further one moves out to MIN_SWITCH_GAP,
    # and the two are joined by a pair of curves.
    near = set()
    links = []
    for e in edges:
        if e[0] in sw and e[-1] in sw:
            L = sum(math.dist(P[x], P[y]) for x, y in zip(e, e[1:]))
            if L < NEAR_SWITCHES:
                if order[e[0]] > order[e[-1]]: e = e[::-1]
                links.append((order[e[0]], P[e[-1]], e, L))
    moved = []
    for _, _, e, L in sorted(links):
        near.add(frozenset((e[0], e[-1])))
        if L < MIN_SWITCH_GAP:
            p = add(P[e[0]], unit(sub(P[e[-1]], P[e[0]])), MIN_SWITCH_GAP)
            moved.append((e[-1], round(math.dist(p, P[e[-1]]), 1))); P[e[-1]] = p

    pieces = []

    def arc(ei, pa, ta, pb):    # a curve from pa, leaving along ta, to pb
        ch = sub(pb, pa); L = math.hypot(*ch)
        th = math.asin(max(-1, min(1, cross(ta, ch) / L)))
        r = 0 if abs(th) < 1e-5 else L / (2 * math.sin(abs(th))) * (1 if th > 0 else -1)
        return (ei, pa, pb, r)

    def leave(P0, t0, X, share):
        """A curve leaving P0 along t0, ending where a straight to X starts."""
        side = 1 if cross(t0, sub(X, P0)) > 0 else -1
        nrm = perp(t0) if side > 0 else neg(perp(t0))
        R = TURNOUT_RADIUS
        while True:
            C = add(P0, nrm, R); d = math.dist(C, X)
            if d > R * 1.0001:
                beta = math.acos(R / d); ph = math.atan2(X[1] - C[1], X[0] - C[0])
                r0 = unit(sub(P0, C)); k = 1 if dot(t0, perp(r0)) > 0 else -1
                for sg in (1, -1):
                    Q = (C[0] + R * math.cos(ph + sg * beta), C[1] + R * math.sin(ph + sg * beta))
                    tq = perp(unit(sub(Q, C))); tq = (k * tq[0], k * tq[1])
                    if dot(tq, unit(sub(X, Q))) > 0.999:
                        sweep = math.acos(max(-1, min(1, dot(r0, unit(sub(Q, C))))))
                        if R * sweep <= share * math.dist(P0, X) or R < 20: return Q, R * side
            R *= 0.9

    for ei, e in enumerate(edges):
        out = []
        t0 = into(e[0], e[1]) if e[0] in sw else None
        tn = into(e[-1], e[-2]) if e[-1] in sw else None
        if frozenset((e[0], e[-1])) in near:          # a biarc between two switches
            A, B, t1 = P[e[0]], P[e[-1]], neg(tn)
            v, tt, c = sub(B, A), add(t0, t1), 1 - dot(t0, t1)
            d = dot(v, v) / (4 * dot(v, t1)) if c < 1e-9 else \
                (-dot(v, tt) + math.sqrt(dot(v, tt) ** 2 + 2 * c * dot(v, v))) / (2 * c)
            M = ((A[0] + d * t0[0] + B[0] - d * t1[0]) / 2, (A[1] + d * t0[1] + B[1] - d * t1[1]) / 2)
            back = arc(ei, B, tn, M)
            out = [arc(ei, A, t0, M), (ei, M, B, -back[3])]
        else:
            pts = simplify([P[n] for n in e], SIMPLIFY)
            for tv, i in ((t0, 1), (tn, -2)):        # points left behind a moved switch
                while tv and len(pts) > 2 and dot(sub(pts[i], pts[0 if i == 1 else -1]), tv) < 5: pts.pop(i)
            inner = pts[1:-1]
            if t0 and tn and not inner: inner = [((pts[0][0] + pts[-1][0]) / 2, (pts[0][1] + pts[-1][1]) / 2)]
            share = 0.45 if t0 and tn and len(inner) == 1 else 0.5
            W = [pts[0]] + inner + [pts[-1]]
            fixed = [True] + [False] * len(inner) + [True]
            head = tail = None
            if t0: Q, r = leave(pts[0], t0, W[1], share); head = (ei, pts[0], Q, r); W[0] = Q
            if tn: Q, r = leave(pts[-1], tn, W[-2], share); tail = (ei, Q, pts[-1], -r); W[-1] = Q
            if head: out.append(head)
            cur = W[0]
            for i in range(1, len(W) - 1):                # round each of OSM's corners
                u, v = unit(sub(W[i], W[i - 1])), unit(sub(W[i + 1], W[i]))
                phi = math.acos(max(-1, min(1, dot(u, v))))
                if phi < 1e-4: continue
                s = min(math.dist(W[i], W[i - 1]) * (1 if fixed[i - 1] else 0.5),
                        math.dist(W[i], W[i + 1]) * (1 if fixed[i + 1] else 0.5),
                        MAX_RADIUS * math.tan(phi / 2))
                a, b = add(W[i], u, -s), add(W[i], v, s)
                out.append((ei, cur, a, 0))
                out.append((ei, a, b, s / math.tan(phi / 2) * (1 if cross(u, v) > 0 else -1))); cur = b
            out.append((ei, cur, W[-1], 0))
            if tail: out.append(tail)
        # merge slivers into a neighbour
        merged = []
        for p in out:
            if math.dist(p[1], p[2]) < SLIVER:
                if merged: merged[-1] = (*merged[-1][:2], p[2], merged[-1][3])
                else: merged.append(p)
                continue
            if merged and math.dist(merged[-1][1], merged[-1][2]) < SLIVER:
                merged[-1] = (p[0], merged[-1][1], p[2], p[3]); continue
            merged.append(p)
        pieces += merged
    return pieces, moved


def name_all(P, G, sw, edges, order, pieces, main_ends):
    ends = [n for e in edges for n in (e[0], e[-1]) if n not in sw]
    names = dict(zip(main_ends, ("mainWest", "mainEast")))
    west = sorted((n for n in ends if n not in names and n.startswith("cut") and P[n][0] < X_WEST + 1), key=lambda n: -P[n][1])
    for i, n in enumerate(west): names[n] = "yard%d" % (i + 1)            # from the main-line side
    lead_end = next(n for n in ends if n not in names and P[n][0] > X_EAST - 1)
    names[lead_end] = "lead"
    names[TURNTABLE_END] = "turntableSpur"
    names.update(STUBS)
    fan = sorted((n for n in ends if n not in names), key=lambda n: P[n][1])
    for i, n in enumerate(fan): names[n] = "fan%d" % (i + 1)               # from the turntable side
    swn = {s: "J%d" % (i + 1) for i, s in enumerate(sorted((s for s in sw if s not in CROSSOVER), key=lambda s: (order[s], P[s])))}
    swn.update(CROSSOVER)

    def key(p): return (round(p[0] - OFFSET[0], 2), round(p[1] - OFFSET[1], 2))
    node_at = {key(P[s]): swn[s] for s in sw}
    for n in ends: node_at[key(P[n])] = names[n] + "End"
    # The main line's two runs are one track, `main`; so are the lead's two,
    # either side of the crossover. Their pieces are numbered west to east.
    def edge_name(e):
        if e[0] in main_ends or e[-1] in main_ends: return "main"
        if e[0] in CROSSOVER and e[-1] in CROSSOVER: return "crossover"
        if lead_end in (e[0], e[-1]) or {e[0], e[-1]} == {"3892462373", ROOT}: return "lead"
        return names.get(e[-1]) or names.get(e[0]) or swn[e[0]] + swn[e[-1]]
    by_name = collections.defaultdict(list)
    for p in pieces: by_name[edge_name(edges[p[0]])].append(p)
    segs = {}
    for nm, ps in by_name.items():
        if len({p[0] for p in ps}) > 1: ps = sorted(ps, key=lambda p: p[1][0] + p[2][0])
        for j, (ei, a, b, r) in enumerate(ps):
            sid = nm if len(ps) == 1 else "%s_%d" % (nm, j + 1)
            for k, label in ((key(a), j), (key(b), j + 1)):
                node_at.setdefault(k, "%sBend%d" % (nm, label))
            segs[sid] = dict(a=node_at[key(a)], b=node_at[key(b)], r=round(r, 1), edge=ei)
    nodes = {v: k for k, v in node_at.items()}
    first = {}
    for sid, sg in segs.items(): first.setdefault(sid.split("_")[0], sg["edge"])
    segs = dict(sorted(segs.items(), key=lambda kv: (first[kv[0].split("_")[0]], int(kv[0].split("_")[1]) if "_" in kv[0] else 0)))
    assert len(nodes) == len(node_at), "two places share a node name"

    def seg_toward(s, nb):
        for sid, sg in segs.items():
            e = edges[sg["edge"]]
            if swn[s] in (sg["a"], sg["b"]) and ((e[0] == s and e[1] == nb) or (e[-1] == s and e[-2] == nb)):
                return sid
    sws = {swn[s]: dict(trunk=seg_toward(s, v["trunk"]), legs=[seg_toward(s, x) for x in v["legs"]],
                        normal=seg_toward(s, v["straight"])) for s, v in sw.items()}
    return nodes, segs, sws, [names[n] + "End" for n in main_ends]


def main():
    P, adj, main = read(sys.argv[1])
    G, main_ends = slice_graph(P, adj, main)
    key, edges = chains(G)
    sw = switches(G, P, key, edges)
    lead_end = next(k for k in key if len(G[k]) == 1 and k not in main_ends and P[k][0] > X_EAST - 1)
    order, todo = {lead_end: 0}, [lead_end]           # distance from the lead's buffer, in links
    while todo:
        n = todo.pop(0)
        for m in sorted(G[n], key=lambda z: P[z]):
            if m not in order: order[m] = order[n] + 1; todo.append(m)
    edges = [e if order[e[0]] < order[e[-1]] else e[::-1] for e in edges]
    pieces, moved = lay(P, sw, edges, order)
    nodes, segs, sws, edge_nodes = name_all(P, G, sw, edges, order, pieces, main_ends)
    print("Switches moved out (OSM node, metres):", moved, file=sys.stderr)
    out = ["  const NODES = {"]
    w = max(map(len, nodes)) + 2
    out += ["    %s{ x: %s, y: %s }," % ((k + ":").ljust(w), x, y) for k, (x, y) in nodes.items()]
    out += ["  };", "  const SEGMENTS = {"]
    w = max(map(len, segs)) + 2
    out += ['    %s{ a: "%s", b: "%s"%s },' % ((k + ":").ljust(w), s["a"], s["b"], ", r: %s" % s["r"] if s["r"] else "")
            for k, s in segs.items()]
    out += ["  };", "  const SWITCHES = {"]
    out += ['    %s{ trunk: "%s", legs: ["%s", "%s"], normal: "%s" },' % ((k + ":").ljust(5), s["trunk"], *s["legs"], s["normal"])
            for k, s in sorted(sws.items(), key=lambda kv: int(kv[0][1:]))]
    out += ["  };",
            "  // Ends of track where the line runs on beyond the map: no buffer stop.",
            "  const MAP_EDGES = [" + ", ".join('"%s"' % n for n in edge_nodes) + "];"]
    print("\n".join(out))


if __name__ == "__main__":
    main()

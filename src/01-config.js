  // ==================================================
  // CONFIG
  // ==================================================
  const GAME_CONFIG = { VERSION: "0.18.0" };
  const STEP_SECONDS = 1 / 60;          // fixed simulation step
  const MAX_STEPS_PER_FRAME = 5;        // drop time rather than spiral after a stall
  const VIEW_MARGIN = 8;                // metres of ground kept around the yard
  const ZOOM_LEVELS = [1.2, 2.4, 4, 6]; // px per metre, whatever the map's size (#53); retunable
  const START_ZOOM = 1;                 // play starts zoomed in, following the loco; an index into ZOOM_LEVELS; retunable
  const MAP_STEPS = 3;                  // the Map's steps out: the yard, the yard as lines, the lines out of Junín (#53)
  const MAP_WIDEN_MAX = 3;              // the Map's yard step widens across the yard up to this many times; retunable
  const DRAG_START_PX = 8;              // CSS px a press moves before it pans instead of tapping
  const TAP_RADIUS_PX = 32;             // CSS px from a switch or coupling that a tap counts; retunable (a fingertip)
  const GAUGE = 1.676;                  // m, Argentine broad gauge (Junín's)
  const TIE_SPACING = 0.65;             // m between tie centres; approximate
  const TIE_LENGTH = 2.75;              // m; approximate
  const TRACK_DETAIL_K = 4;             // px per metre at which track is drawn as rails and ties; retunable
  const SWITCH_DIM_LENGTH = 25;         // m of the unset leg faded past a switch; retunable
  const SWITCH_DIM_STEPS = 5;           // steps the fade is drawn in
  const G = 9.81;                       // m/s²

  // Locomotive pull, modelled on a GM G12 as run in Argentina. The reverser
  // sets its direction (cab end first is forward); each throttle notch gives
  // an equal share of the pull; above LOCO_POWER / LOCO_MAX_FORCE (about
  // 4.3 m/s) the engine's power limits it.
  const THROTTLE_NOTCHES = 4;           // retunable
  const LOCO_MAX_FORCE = 187e3;         // N at full notch; the G12's rated tractive effort
  const LOCO_POWER = 977e3 * 0.8;       // W at the rail: the G12's 977 kW engine less an estimated fifth lost on the way; retunable
  const LOCO_MAX_SPEED = 8;             // m/s (29 km/h); a yard limit, not the G12's own; pull fades to nothing over the last GOVERNOR_BAND
  const GOVERNOR_BAND = 1;              // m/s

  // Rolling resistance, from the constant part of the Davis equation:
  // 1.3 lb per short ton of weight plus a fixed drag per axle that depends
  // on the bearings (29 lb plain, 18 lb roller; AAR RP-548). The speed terms
  // add little at yard speeds and are left out. A loaded 60 t box car on
  // plain bearings comes to about 0.0015 of its weight and rolls about 255 m
  // from 10 km/h; an empty one about 0.0028, 145 m.
  // See docs/reference/train-physics.md.
  const LBF = 4.448;                    // N per pound-force
  const SHORT_TON = 907.2;              // kg
  const DAVIS_WEIGHT_SHARE = 1.3 * LBF / (SHORT_TON * G);  // share of weight, ≈ 0.00065
  const BEARING_AXLE_DRAG = { plain: 29 * LBF, roller: 18 * LBF };  // N per axle
  const STARTING_RESISTANCE = { plain: 0.01, roller: 0.0025 };     // share of weight to get a standing vehicle moving; Unconfirmed, retunable

  // Curve resistance: about 0.7 lb per short ton per degree of curve, where
  // a curve of radius R metres is 1746.4 / R degrees (100 ft chord
  // definition). A vehicle on a curve adds CURVE_RESISTANCE / R of its
  // weight: about 0.004 at 150 m, 0.0075 at 82 m.
  const CURVE_LB_PER_TON_DEGREE = 0.7;  // Secondary; retunable
  const CURVE_RESISTANCE = CURVE_LB_PER_TON_DEGREE * LBF / (SHORT_TON * G) * 1746.4;  // m

  // Brakes. Each is a notched lever; the force builds toward the lever's
  // setting at its rate, as a share of full per second.
  const LOCO_BRAKE_NOTCHES = 4;         // retunable
  const LOCO_BRAKE_RATIO = 0.15;        // full force as a share of the loco's weight; retunable
  const LOCO_BRAKE_RATE = 2;            // full in half a second
  const TRAIN_BRAKE_NOTCHES = 5;        // retunable
  const TRAIN_BRAKE_RATIO = 0.1;        // full force as a share of the whole train's weight; retunable
  const TRAIN_BRAKE_APPLY_RATE = 1 / 4; // full in 4 s; retunable
  const TRAIN_BRAKE_RELEASE_RATE = 1 / 5; // off in 5 s; retunable
  const EMERGENCY_RATE = 1;             // full train brake in 1 s; retunable
  // The train brake works only on cars whose air is connected all the way
  // back to the loco. A coupling's air, once connected, charges over
  // AIR_CHARGE_SECONDS; a real brake pipe takes minutes.
  const AIR_CHARGE_SECONDS = 15;        // retunable
  // A hand brake: about a tenth of a loaded car's weight pressed on the
  // shoes, at a shoe friction near 0.3. The same force on every car, so an
  // empty stops sooner than a load. Unconfirmed; retunable.
  const HAND_BRAKE_FORCE = 0.1 * 0.3 * 60e3 * G;  // N, ≈ 17.7 kN

  // Contact (#33). Every vehicle has side buffers and a hook, as on FA's
  // broad gauge: ends that meet touch buffers and push, and never couple on
  // their own. Ends meeting faster than HARD_HIT_SPEED are a hard hit: a
  // jolt, and the two bounce apart by HARD_HIT_RESTITUTION.
  const HARD_HIT_SPEED = 5 / 3.6;       // m/s closing speed; retunable
  // Coupling is a shunter's work (#33): Hook up puts the link over the hook
  // and tightens the screw until the buffers meet (MR-706 D-8); Uncouple
  // slackens and unhooks it. Either takes HOOK_UP_SECONDS, with both
  // vehicles standing. Ends up to HOOK_REACH apart can be hooked up: the
  // reach of a slackened screw coupling, the gap closed as it tightens.
  const HOOK_UP_SECONDS = 10;           // s; "a few seconds" (Tom, 2026-11-24); retunable
  const HOOK_REACH = 0.15;              // m; estimated, retunable

  // Slack. A screw coupling is tightened until the buffers touch, so it has
  // SCREW_FREE_PLAY; a two-axle car's chain link is left slack (RITO art.
  // 210 b), CHAIN_FREE_PLAY (#26's 5 cm). Inside the free play, nothing
  // passes between the two vehicles. Past it, stretched or bunched, the
  // buffers and draft gear act as a stiff damped spring, rated at
  // DRAFT_GEAR_FORCE over DRAFT_GEAR_TRAVEL (AAR M-901-G: 500,000 lb over
  // about 3 in). Secondary; see docs/reference/train-physics.md. The spring
  // is stiff, so the simulation takes SLACK_SUBSTEPS smaller steps within
  // each fixed step.
  const SCREW_FREE_PLAY = 0;            // m: nearly tight (Tom, 2026-11-24)
  const CHAIN_FREE_PLAY = 0.05;         // m, about 2 in; Unconfirmed, retunable
  const DRAFT_GEAR_TRAVEL = 0.075;      // m, about 3 in
  const DRAFT_GEAR_FORCE = 500e3 * LBF; // N at full travel, ≈ 2.2 MN
  const DRAFT_GEAR_STIFFNESS = DRAFT_GEAR_FORCE / DRAFT_GEAR_TRAVEL;  // N/m, ≈ 30 MN/m
  const DRAFT_GEAR_DAMPING = 0.5;       // share of critical damping; friction draft gears soak up a lot; estimated, retunable
  const SLACK_SUBSTEPS = 8;             // keeps the spring stable: about 0.1 rad of its swing a substep
  const HARD_HIT_RESTITUTION = 0.3;     // retunable
  // The clock runs at real time, one game second a step-second, and counts
  // seconds from midnight before day 1. Shifts are SHIFT_HOURS long from
  // FIRST_SHIFT_HOUR; a new yard starts at the first. Skip jumps, with
  // everything standing, to an event ahead or a SKIP_MARK_SECONDS mark.
  // See docs/design/time.md.
  const HOUR = 3600;                    // s
  const DAY = 24 * HOUR;                // s
  const SHIFT_HOURS = 8;                // 06–14, 14–22, 22–06
  const FIRST_SHIFT_HOUR = 6;
  const START_CLOCK = FIRST_SHIFT_HOUR * HOUR;  // 06:00, day 1
  const SKIP_MARK_SECONDS = 10 * 60;    // marks at xx:x0
  const SKIP_MARKS_SHOWN = 4;           // marks the Skip menu lists, and adds a press of "…"; retunable
  // Operations (#48, #49): traffic, dispositions, jobs and results. See
  // docs/design/. Road trains run to TIMETABLE; an arrival brings up to
  // ARRIVAL_CARS_MAX cars, topped up from the pool toward ARRIVAL_CARS_MIN
  // while the plan is short of cars, and a departure takes up to
  // DEPARTURE_MAX_CARS, so a whole train fits the 281 m head-shunt behind
  // the loco (16 cars of 15.5 m average and a 14 m loco: 262 m).
  const ARRIVAL_CARS_MIN = 8;           // retunable
  const ARRIVAL_CARS_MAX = 12;          // retunable
  const DEPARTURE_MAX_CARS = 16;        // retunable
  // The traffic plan (#50; docs/design/traffic.md). Each flow keeps about
  // the cars its rate needs over a cycle: its rate a day times the cycle,
  // the stations' round trips plus YARD_DAYS_PER_PASS for each pass
  // through Junín. An arrival with fewer than ARRIVAL_CARS_MIN cars due
  // takes more from the pool, the San Martín's cars elsewhere on the line,
  // for flows short of their share;
  // a car leaving when its flow has more than FLOW_SLACK over its share
  // stays out there, in the pool, and one in the pool POOL_KEEP_DAYS is
  // forgotten. POOL_LINE_SHARE of the cars new to the game keep the
  // San Martín's own initials. All retunable.
  const YARD_DAYS_PER_PASS = 1.5;       // days a car spends at Junín each time through; estimated
  const FLOW_SLACK = 2;                 // cars
  const POOL_KEEP_DAYS = 60;
  const POOL_LINE_SHARE = 0.1;
  // A trip takes its station's round trip, give or take this share, so
  // cars that left together don't all come back together.
  const TRIP_SPREAD = 0.25;             // retunable
  // Industries at Junín (#84). Each has INDUSTRY_SPOTS spots, numbered
  // from its track's buffer, SPOT_LENGTH apart: a car is on a spot when
  // its middle is. A set-out takes up to that many cars. The elevator loads
  // a cut set out by the next shift change; each of the goods shed's doors
  // unloads or loads its car in SHED_WORK_TIME. Retunable; the times are
  // assumed.
  const INDUSTRY_SPOTS = 6;
  const SPOT_LENGTH = 16;               // m; a car is at most 15.5 m
  const SHED_WORK_TIME = 2 * HOUR;
  // Main-line traffic and authority to move (#56, #57; see
  // docs/design/living-railway.md). A through train is offered
  // OFFER_LEAD_SECONDS before it reaches the map's edge and runs through at
  // THROUGH_SPEED; held, it stands at the east home signal, HOME_SIGNAL_IN
  // metres in from the map's east edge, or waits off the map at the station
  // side. The player asks for the main for one of MAIN_ASK_MINUTES.
  // A passenger train gets a conditional line clear only by day (#104;
  // RITO art. 64 d 3): offered outside DAYLIGHT_FROM to DAYLIGHT_TO with the
  // main not clear, it is refused line clear (art. 65) and waits at the
  // station behind until the main is clear, then sets off, still
  // OFFER_LEAD_SECONDS out. Daylight is a fixed window, the same all year,
  // rounding Junín's sunrise and sunset; retunable.
  const OFFER_LEAD_SECONDS = 10 * 60;   // roughly the run from La Oriental; retunable
  const THROUGH_SPEED = 40 / 3.6;       // m/s; retunable
  const THROUGH_ACCEL = 0.15;           // m/s², a held train starting away; retunable
  const HOME_SIGNAL_IN = 330;           // m; more than the longest through train (14 m + 15 cars: 243 m); retunable
  const DAYLIGHT_FROM = 6 * HOUR;
  const DAYLIGHT_TO = 20 * HOUR;
  const MAIN_ASK_MINUTES = [10, 20, 30];  // retunable
  // A job is inefficient when its moves pass this many per car handled
  // and per block. A move is each change of direction of the player's
  // loco (#62), so stopping to throw a switch or uncouple isn't one.
  const PAR_PER_CAR_AND_BLOCK = 1.5;    // retunable
  // The train register (#62, RITO art. 41): a train less than
  // ON_TIME_SECONDS late shows on time, and the register keeps
  // REGISTER_DAYS days, today's and yesterday's.
  const ON_TIME_SECONDS = 60;
  const REGISTER_DAYS = 2;
  // A coupling closing faster than this damages the car: it goes bad order.
  const DAMAGE_SPEED = HARD_HIT_SPEED;  // retunable
  // A car stands clear of the ladder where its yard track is this far from
  // any other track, centre to centre: about a car's width. Each track's
  // fouling point is worked out from it. Tracks 4 and 5 run as little as
  // 3.2 m apart in the game's layout, so it can't be more. Unconfirmed;
  // retunable.
  const FOULING_CLEARANCE = 3;          // m
  const SET_BACK = 1;                   // m off the buffer that cars set by another crew stand
  const HISTORY_KEPT = 20;              // entries a car's history keeps
  const JOBS_KEPT = 8;                  // finished jobs the board keeps
  const NOTICE_SECONDS = 2;             // how long a message stays up
  const SAVE_SECONDS = 5;               // s of play between saves; leaving the page saves too; retunable
  const EPS = 1e-6;                     // metres; positions this close are the same


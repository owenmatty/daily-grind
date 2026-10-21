const v = (name, scale = 1, load = '') => ({ name, scale, load })

// Block A focus rotates one step per day, so consecutive days never share a focus.
export const FOCI = ['squat', 'press', 'olympic', 'pull', 'hinge', 'gymnastics']

export const MOVEMENTS = [
  // ---- Block A main lifts ----
  { id: 'back_squat', roles: ['main'], focus: 'squat', title: 'Squat', pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 6, sec: 3,
    levels: [v('Box Squats', 1.25), v('Goblet Squats', 1.25, '(16/12)'), v('Back Squats', 1, '@ 65%'), v('Back Squats', 0.75, '@ 75%'), v('Back Squats', 0.6, '@ 82%'), v('Back Squats', 0.5, '@ 88%')] },
  { id: 'front_squat', roles: ['main'], focus: 'squat', title: 'Front Squat', pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 6, sec: 3,
    levels: [v('Air Squats', 1.5), v('DB Front Squats', 1.25, '(2x12.5/10)'), v('Front Squats', 1, '@ 65%'), v('Front Squats', 0.75, '@ 75%'), v('Front Squats', 0.6, '@ 80%'), v('Front Squats', 0.5, '@ 85%')] },
  { id: 'strict_press', roles: ['main'], focus: 'press', title: 'Press', pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 6, sec: 3,
    levels: [v('DB Strict Press', 1.25, '(2x7.5/5)'), v('DB Strict Press', 1, '(2x12.5/10)'), v('Strict Press', 1, '@ 65%'), v('Strict Press', 0.75, '@ 75%'), v('Strict Press', 0.6, '@ 82%'), v('Strict Press', 0.5, '@ 88%')] },
  { id: 'push_press', roles: ['main'], focus: 'press', title: 'Push Press', pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 6, sec: 3,
    levels: [v('DB Push Press', 1.25, '(2x10/7.5)'), v('DB Push Press', 1, '(2x15/10)'), v('Push Press', 1, '@ 65%'), v('Push Press', 0.75, '@ 75%'), v('Push Press', 0.6, '@ 82%'), v('Push Press', 0.5, '@ 88%')] },
  { id: 'pike_hspu', roles: ['main'], focus: 'press', title: 'Handstand', repCap: 8, pattern: 'press', tags: ['Upper Body Push', 'Gymnastics'], unit: 'reps', base: 6, sec: 4,
    levels: [v('Pike Push-ups'), v('Box Pike Push-ups'), v('Piked HSPU'), v('Kipping HSPU'), v('Strict HSPU'), v('Deficit Strict HSPU', 0.75, '(5cm)')] },
  { id: 'power_clean', roles: ['main'], focus: 'olympic', title: 'Power Cleans', repCap: 3, pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 3, sec: 5,
    levels: [v('PVC Hang Cleans', 2), v('DB Hang Power Cleans', 1.5, '(2x10/7.5)'), v('Hang Power Cleans', 1, '@ 60%'), v('Power Cleans', 1, '@ 70%'), v('Power Cleans', 0.67, '@ 78%'), v('Squat Cleans', 0.67, '@ 82%')] },
  { id: 'power_snatch', roles: ['main'], focus: 'olympic', title: 'Snatch', repCap: 3, pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 3, sec: 5,
    levels: [v('PVC Overhead Squats', 2), v('DB Snatches', 1.5, '(15/10)'), v('Hang Power Snatches', 1, '@ 60%'), v('Power Snatches', 1, '@ 70%'), v('Power Snatches', 0.67, '@ 78%'), v('Squat Snatches', 0.67, '@ 80%')] },
  { id: 'strict_pullup', roles: ['main'], focus: 'pull', title: 'Rings', repCap: 6, pattern: 'pull', tags: ['Upper Body Pull', 'Gymnastics'], unit: 'reps', base: 5, sec: 4,
    levels: [v('Ring Rows', 1.5), v('Banded Pull-ups'), v('Jumping Pull-ups', 1, '(slow lower)'), v('Strict Pull-ups'), v('Weighted Pull-ups', 1, '(+5kg)'), v('Weighted Pull-ups', 1, '(+10kg)')] },
  { id: 'bent_row', roles: ['main'], focus: 'pull', title: 'Row', pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 8, sec: 3,
    levels: [v('DB Rows e/s', 1.25, '(15/10)'), v('DB Rows e/s', 1, '(22.5/15)'), v('Bent-over Rows', 1, '@ 60%'), v('Bent-over Rows', 0.75, '@ 70%'), v('Pendlay Rows', 0.6, '@ 75%'), v('Pendlay Rows', 0.5, '@ 80%')] },
  { id: 'deadlift', roles: ['main'], focus: 'hinge', title: 'Deadlift', pattern: 'hinge', tags: ['Posterior Chain'], unit: 'reps', base: 6, sec: 3,
    levels: [v('KB Deadlifts', 1.25, '(24/16)'), v('Trap Bar Deadlifts', 1, '@ 60%'), v('Deadlifts', 1, '@ 65%'), v('Deadlifts', 0.75, '@ 75%'), v('Deadlifts', 0.6, '@ 82%'), v('Deadlifts', 0.5, '@ 88%')] },
  { id: 'rdl', roles: ['main'], focus: 'hinge', title: 'Hinge', pattern: 'hinge', tags: ['Posterior Chain'], unit: 'reps', base: 8, sec: 3,
    levels: [v('KB RDLs', 1.25, '(16/12)'), v('DB RDLs', 1, '(2x15/10)'), v('Romanian Deadlifts', 1, '@ 50%'), v('Romanian Deadlifts', 0.85, '@ 60%'), v('Romanian Deadlifts', 0.75, '@ 65%'), v('Romanian Deadlifts', 0.65, '@ 70%')] },
  { id: 'muscle_up', roles: ['main'], focus: 'gymnastics', title: 'Gymnastics', repCap: 5, pattern: 'pull', tags: ['Gymnastics', 'Upper Body Pull'], unit: 'reps', base: 4, sec: 5,
    levels: [v('Hollow-to-Arch Swings', 2), v('Jumping Chest-to-Bar'), v('Chest-to-Bar Pull-ups'), v('Banded Bar Muscle-ups'), v('Bar Muscle-ups'), v('Ring Muscle-ups')] },

  // ---- Block A accessories ----
  { id: 'wtd_deadbug', roles: ['acc'], pattern: 'core', tags: ['Neurological and Core'], unit: 'reps', base: 12, sec: 2,
    levels: [v('Deadbugs'), v('Deadbugs', 1.25), v('WTD Deadbugs', 1, '(2.5kg)'), v('WTD Deadbugs', 1, '(5kg)'), v('WTD Deadbugs', 1.25, '(5kg)'), v('WTD Deadbugs', 1, '(10kg)')] },
  { id: 'glute_bridge', roles: ['acc'], pattern: 'hinge', tags: ['Posterior Chain'], unit: 'reps', base: 10, sec: 2,
    levels: [v('Glute Bridges', 1.5), v('SL Glute Bridges e/s'), v('SL Elevated Glute Bridges e/s'), v('SL Elevated Glute Bridges e/s', 1.25), v('Hip Thrusts', 1, '(40/30)'), v('Hip Thrusts', 1, '(60/40)')] },
  { id: 'ring_dip', roles: ['acc'], pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 4, sec: 3,
    levels: [v('Box Dips', 2), v('Banded Ring Dips'), v('Bar Dips'), v('Strict Ring Dips'), v('Strict Ring Dips', 1.5), v('Weighted Ring Dips', 1, '(+5kg)')] },
  { id: 'hollow_hold', roles: ['acc'], pattern: 'core', tags: ['Neurological and Core'], unit: 's', base: 20, sec: 1,
    levels: [v('Tuck Hold'), v('Hollow Hold'), v('Hollow Hold', 1.5), v('Hollow Hold', 2), v('Weighted Hollow Hold', 1.5, '(5kg)'), v('Weighted Hollow Hold', 2, '(5kg)')] },
  { id: 'copenhagen', roles: ['acc'], pattern: 'core', tags: ['Neurological and Core'], unit: 's', base: 20, sec: 1,
    levels: [v('Side Plank e/s'), v('Side Plank e/s', 1.5), v('Short Copenhagen Plank e/s'), v('Copenhagen Plank e/s'), v('Copenhagen Plank e/s', 1.5), v('Copenhagen Plank e/s', 2)] },
  { id: 'db_row', roles: ['acc'], pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 10, sec: 2,
    levels: [v('Ring Rows'), v('DB Rows e/s', 1, '(10/7.5)'), v('DB Rows e/s', 1, '(17.5/12.5)'), v('DB Rows e/s', 1, '(22.5/15)'), v('DB Rows e/s', 1, '(27.5/20)'), v('DB Rows e/s', 1, '(32.5/22.5)')] },
  { id: 'farmer_carry', roles: ['acc', 'cond'], schemes: false, pattern: 'carry', tags: ['Grip'], unit: 'm', base: 30, sec: 0.6,
    levels: [v('Farmer Carry', 1, '(2x12/8)'), v('Farmer Carry', 1, '(2x16/12)'), v('Farmer Carry', 1, '(2x24/16)'), v('Farmer Carry', 1, '(2x32/24)'), v('Farmer Carry', 1.5, '(2x32/24)'), v('Farmer Carry', 1.5, '(2x40/28)')] },

  // ---- Block B conditioning ----
  { id: 'burpee', roles: ['cond'], pattern: 'bodyweight', tags: ['Bodyweight'], unit: 'reps', base: 10, sec: 4,
    levels: [v('Step-back Burpees', 0.8), v('Burpees', 0.8), v('Burpees'), v('Burpees over DB'), v('Bar-facing Burpees', 1.2), v('Burpee Box Jump Overs', 1, '(24/20")')] },
  { id: 'wallball', roles: ['cond'], hiRep: true, pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 15, sec: 2.5,
    levels: [v('Wallballs', 1, '(3/2)'), v('Wallballs', 1, '(4/3)'), v('Wallballs', 1, '(6/4)'), v('Wallballs', 1, '(9/6)'), v('Wallballs', 1.2, '(9/6)'), v('Wallballs', 1.2, '(12/9)')] },
  { id: 'thruster', roles: ['cond'], pattern: 'squat', tags: ['Lower Body', 'Upper Body Push'], unit: 'reps', base: 10, sec: 3,
    levels: [v('PVC Thrusters'), v('DB Thrusters', 1, '(2x7.5/5)'), v('DB Thrusters', 1, '(2x12.5/10)'), v('Thrusters', 1, '(40/30)'), v('Thrusters', 1, '(43/30)'), v('Thrusters', 1, '(50/35)')] },
  { id: 'box_step_over', roles: ['cond'], pattern: 'squat', tags: ['Lower Body'], unit: 'reps', base: 12, sec: 3,
    levels: [v('Box Step Ups', 1, '(16")'), v('Box Step Overs', 1, '(20")'), v('Box Step Overs', 1, '(24/20")'), v('DB Box Step Overs', 1, '(15/10)'), v('Box Jump Overs', 1, '(24/20")'), v('Box Jump Overs', 1.25, '(24/20")')] },
  { id: 'kb_swing', roles: ['cond'], hiRep: true, pattern: 'hinge', tags: ['Kettlebell'], unit: 'reps', base: 15, sec: 2,
    levels: [v('Russian KB Swings', 1, '(8/6)'), v('Russian KB Swings', 1, '(12/8)'), v('Russian KB Swings', 1, '(16/12)'), v('American KB Swings', 1, '(24/16)'), v('American KB Swings', 1, '(28/20)'), v('American KB Swings', 1, '(32/24)')] },
  { id: 'sa_kb_swing', roles: ['cond'], pattern: 'hinge', tags: ['Kettlebell'], unit: 'reps', base: 10, sec: 2,
    levels: [v('Alternating SA KB Swings', 1, '(8/6)'), v('Alternating SA KB Swings', 1, '(12/8)'), v('Alternating SA KB Swings', 1, '(16/12)'), v('Alternating SA KB Swings', 1, '(20/14)'), v('Alternating SA KB Swings', 1, '(24/16)'), v('Alternating SA KB Swings', 1, '(28/20)')] },
  { id: 'db_snatch', roles: ['cond'], pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 10, sec: 3,
    levels: [v('Alternating DB Snatches', 1, '(5/2.5)'), v('Alternating DB Snatches', 1, '(10/7.5)'), v('Alternating DB Snatches', 1, '(15/10)'), v('Alternating DB Snatches', 1, '(22.5/15)'), v('Alternating DB Snatches', 1, '(25/17.5)'), v('Alternating DB Snatches', 1, '(27.5/20)')] },
  { id: 'hang_power_clean', roles: ['cond'], pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 8, sec: 3.5,
    levels: [v('PVC Hang Cleans'), v('DB Hang Cleans', 1, '(2x10/7.5)'), v('Hang Power Cleans', 1, '(30/20)'), v('Hang Power Cleans', 1, '(40/30)'), v('Hang Power Cleans', 1, '(50/35)'), v('Hang Squat Cleans', 1, '(60/40)')] },
  { id: 'medball_clean', roles: ['cond'], pattern: 'olympic', tags: ['Weightlifting'], unit: 'reps', base: 10, sec: 2.5,
    levels: [v('Medball Cleans', 1, '(4/3)'), v('Medball Cleans', 1, '(6/4)'), v('Medball Cleans', 1, '(9/6)'), v('Medball Cleans', 1.2, '(9/6)'), v('Medball Cleans', 1, '(12/9)'), v('Medball Cleans', 1.2, '(12/9)')] },
  { id: 'pushup', roles: ['cond'], pattern: 'press', tags: ['Upper Body Push'], unit: 'reps', base: 10, sec: 2.5,
    levels: [v('Box Push-ups', 1, '(24")'), v('Box Push-ups', 1, '(16")'), v('Push-ups'), v('Hand-release Push-ups'), v('Deficit Push-ups'), v('Ring Push-ups')] },
  { id: 'wall_walk', roles: ['cond'], schemes: false, pattern: 'press', tags: ['Upper Body Push', 'Gymnastics'], unit: 'reps', base: 2, sec: 15,
    levels: [v('Plank Shoulder Taps', 5), v('Inchworms', 2), v('Half Wall Walks'), v('Wall Walks'), v('Wall Walks', 1.5), v('Wall Walks', 2)] },
  { id: 'pullup', roles: ['cond'], pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 8, sec: 3,
    levels: [v('Ring Rows', 1.5), v('Banded Pull-ups'), v('Jumping Pull-ups'), v('Kipping Pull-ups'), v('Chest-to-Bar Pull-ups'), v('Bar Muscle-ups', 0.5)] },
  { id: 'ring_row', roles: ['cond'], pattern: 'pull', tags: ['Upper Body Pull'], unit: 'reps', base: 10, sec: 2.5,
    levels: [v('Ring Rows', 1, '(upright)'), v('Ring Rows'), v('Ring Rows', 1, '(feet elevated)'), v('Strict Pull-ups', 0.6), v('Strict Chin-ups', 0.8), v('Strict Chest-to-Bar', 0.6)] },
  { id: 'toes_to_bar', roles: ['cond'], pattern: 'core', tags: ['Neurological and Core'], unit: 'reps', base: 10, sec: 3,
    levels: [v('Lying Leg Raises'), v('Hanging Knee Raises'), v('Hanging Leg Raises'), v('Toes-to-Bar'), v('Toes-to-Bar', 1.25), v('Strict Toes-to-Bar')] },
  { id: 'sit_up', roles: ['cond'], hiRep: true, pattern: 'core', tags: ['Neurological and Core'], unit: 'reps', base: 15, sec: 2,
    levels: [v('Crunches'), v('Sit-ups'), v('AbMat Sit-ups'), v('AbMat Sit-ups', 1.25), v('GHD Sit-ups', 0.75), v('GHD Sit-ups')] },
  { id: 'jump_rope', roles: ['cond'], schemes: false, pattern: 'mono', tags: ['Monostructural'], unit: 'reps', base: 40, sec: 0.5,
    levels: [v('Jumping Jacks'), v('Single-unders'), v('Single-unders', 1.5), v('Double-unders', 0.5), v('Double-unders', 0.75), v('Double-unders')] },
  { id: 'run', roles: ['cond'], schemes: false, pattern: 'mono', tags: ['Monostructural'], unit: 'm', base: 400, sec: 0.25,
    levels: [v('Walk/Jog', 0.5), v('Run', 0.5), v('Run', 0.75), v('Run'), v('Run'), v('Run', 1.25)] },
  { id: 'row', roles: ['cond'], hiRep: true, pattern: 'mono', tags: ['Monostructural'], unit: 'cal', base: 12, sec: 4.5,
    levels: [v('Row', 0.6), v('Row', 0.8), v('Row'), v('Row'), v('Row', 1.2), v('Row', 1.4)] },
  { id: 'bike', roles: ['cond'], hiRep: true, pattern: 'mono', tags: ['Monostructural'], unit: 'cal', base: 10, sec: 5,
    levels: [v('Bike', 0.6), v('Bike', 0.8), v('Bike'), v('Bike'), v('Bike', 1.2), v('Bike', 1.4)] },
  { id: 'ski', roles: ['cond'], hiRep: true, pattern: 'mono', tags: ['Monostructural'], unit: 'cal', base: 12, sec: 5,
    levels: [v('Ski Erg', 0.6), v('Ski Erg', 0.8), v('Ski Erg'), v('Ski Erg'), v('Ski Erg', 1.2), v('Ski Erg', 1.4)] },
]

const BY_ID = new Map(MOVEMENTS.map((m) => [m.id, m]))

export function getMovement(id) {
  const m = BY_ID.get(id)
  if (!m) throw new Error(`Unknown movement: ${id}`)
  return m
}

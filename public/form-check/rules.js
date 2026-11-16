// Proper-form rules for each kind of exercise, based on standard coaching cues
// (NSCA / ACE technique guides): range of motion, joint positions that should stay
// still, body position, and a controlled tempo.
//
// Angles are in degrees, measured from the camera image:
//   elbow    shoulder–elbow–wrist (180 = straight arm)
//   shoulder hip–shoulder–elbow   (0 = arm by your side, 90 = arm straight out)
//   hip      shoulder–hip–knee    (180 = standing tall)
//   knee     hip–knee–ankle       (180 = straight leg)
//   ankle    knee–ankle–toes      (bigger = up on your toes)
//   lean     torso tilt from vertical (0 = upright)
//   forearm  forearm tilt from vertical (0 = forearm straight up and down)
//   spread   distance between wrists ÷ shoulder width
//   body     shoulder–hip–ankle line (180 = straight plank)
//
// A check looks at one number per rep:
//   min / max     lowest or highest value during the rep
//   range         max − min during the rep
//   peak          value at the deepest point of the rep
//   duration      seconds the rep took
// and passes when it is on the right side of `target`. `tol` is how far past the
// target the score drops to zero, so near misses still earn partial credit.

const TEMPO = (min = 1.5) => ({
  id: 'tempo',
  label: 'Controlled tempo',
  stat: 'duration',
  op: '>=',
  target: min,
  tol: min * 0.6,
  unit: 's',
  weight: 0.6,
  tip: 'Slow down. Take about 2 seconds to lower the weight and don’t bounce out of the bottom.',
});

export const TEMPLATES = {
  flatPress: {
    view: 'side',
    setup: 'Prop your phone to your side, level with the bench, so your arm and shoulder are in view.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist'],
    checks: [
      { id: 'depth', label: 'Full depth', feature: 'elbow', stat: 'min', op: '<=', target: 90, tol: 30, joint: 'elbow', tip: 'Lower the weight further, until your elbows bend to about 90° or the bar touches your chest.' },
      { id: 'lockout', label: 'Press to the top', feature: 'elbow', stat: 'max', op: '>=', target: 155, tol: 25, joint: 'elbow', tip: 'Press all the way up until your arms are almost straight.' },
      { id: 'stack', label: 'Wrists over elbows', feature: 'forearm', stat: 'peak', op: '<=', target: 20, tol: 25, joint: 'wrist', tip: 'Keep your wrists stacked right above your elbows at the bottom, so your forearms stay vertical.' },
      TEMPO(),
    ],
  },
  overheadPress: {
    view: 'side',
    setup: 'Put your phone to your side at chest height, about 6 ft away, with your upper body in frame.',
    primary: { feature: 'elbow', dir: 'any', minRom: 25 }, // seated presses often start at the bottom
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'depth', label: 'Full depth', feature: 'elbow', stat: 'min', op: '<=', target: 95, tol: 30, joint: 'elbow', tip: 'Bring the weights down to about ear or shoulder level each rep.' },
      { id: 'lockout', label: 'Press overhead', feature: 'elbow', stat: 'max', op: '>=', target: 160, tol: 25, joint: 'elbow', tip: 'Press until your arms are straight overhead.' },
      { id: 'arch', label: 'No back arch', feature: 'lean', stat: 'max', op: '<=', target: 15, tol: 20, joint: 'hip', tip: 'Brace your core and squeeze your glutes. You’re leaning back too much as you press.' },
      { id: 'stack', label: 'Forearms vertical', feature: 'forearm', stat: 'peak', op: '<=', target: 25, tol: 25, joint: 'wrist', tip: 'Keep your forearms vertical, with wrists over elbows, at the bottom.' },
      TEMPO(),
    ],
  },
  dip: {
    view: 'side',
    setup: 'Put your phone to your side, about 6 ft away, with your whole upper body in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'depth', label: 'Full depth', feature: 'elbow', stat: 'min', op: '<=', target: 95, tol: 30, joint: 'elbow', tip: 'Lower until your elbows reach about 90°.' },
      { id: 'lockout', label: 'Press to the top', feature: 'elbow', stat: 'max', op: '>=', target: 155, tol: 25, joint: 'elbow', tip: 'Push all the way back up until your arms are straight.' },
      { id: 'lean', label: 'Controlled lean', feature: 'lean', stat: 'max', op: '<=', target: 35, tol: 20, joint: 'hip', tip: 'Don’t pitch too far forward. Lean only slightly.' },
      TEMPO(),
    ],
  },
  row: {
    view: 'side',
    setup: 'Put your phone to your side at hip height, about 6–8 ft away, with your whole body in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'squeeze', label: 'Full squeeze', feature: 'elbow', stat: 'min', op: '<=', target: 85, tol: 30, joint: 'elbow', tip: 'Pull further. Drive your elbow back past your body and squeeze your shoulder blades.' },
      { id: 'stretch', label: 'Full stretch', feature: 'elbow', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'elbow', tip: 'Let your arms straighten all the way at the bottom to stretch your back.' },
      { id: 'still', label: 'No body swing', feature: 'lean', stat: 'range', op: '<=', target: 12, tol: 15, joint: 'hip', tip: 'Keep your torso still. You’re using your body to swing the weight, so go a little lighter.' },
      TEMPO(),
    ],
  },
  bentRow: {
    view: 'side',
    setup: 'Put your phone to your side at hip height, about 6–8 ft away, with your whole body in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip', 'knee'],
    checks: [
      { id: 'squeeze', label: 'Full squeeze', feature: 'elbow', stat: 'min', op: '<=', target: 85, tol: 30, joint: 'elbow', tip: 'Pull the bar into your lower chest or belly, driving your elbows back.' },
      { id: 'stretch', label: 'Full stretch', feature: 'elbow', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'elbow', tip: 'Lower the bar until your arms are straight.' },
      { id: 'hinge', label: 'Bent over enough', feature: 'lean', stat: 'min', op: '>=', target: 40, tol: 25, joint: 'hip', tip: 'Hinge over more at the hips. Your torso should be about 45° or lower.' },
      { id: 'still', label: 'No body swing', feature: 'lean', stat: 'range', op: '<=', target: 12, tol: 15, joint: 'hip', tip: 'Hold your torso angle still and don’t stand up to heave the weight.' },
      TEMPO(),
    ],
  },
  pulldown: {
    view: 'side',
    setup: 'Put your phone to your side, about 6–8 ft away, so your arms all the way up are in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'squeeze', label: 'Pull all the way', feature: 'elbow', stat: 'min', op: '<=', target: 80, tol: 30, joint: 'elbow', tip: 'Pull until the bar reaches your upper chest (or your chin clears the bar).' },
      { id: 'stretch', label: 'Full stretch', feature: 'elbow', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'elbow', tip: 'Let your arms go nearly straight at the top of every rep.' },
      { id: 'lean', label: 'Not leaning back', feature: 'lean', stat: 'max', op: '<=', target: 25, tol: 20, joint: 'hip', tip: 'Don’t lean way back. Stay mostly upright with a small lean.' },
      { id: 'still', label: 'No swinging', feature: 'lean', stat: 'range', op: '<=', target: 12, tol: 15, joint: 'hip', tip: 'Keep your body still. Don’t rock or kip to move the weight.' },
      TEMPO(),
    ],
  },
  facePull: {
    view: 'side',
    setup: 'Put your phone to your side at shoulder height, about 6 ft away.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'squeeze', label: 'Pull to your face', feature: 'elbow', stat: 'min', op: '<=', target: 90, tol: 30, joint: 'elbow', tip: 'Pull the rope all the way to your face, hands by your ears.' },
      { id: 'high', label: 'Elbows high', feature: 'shoulder', stat: 'peak', op: '>=', target: 70, tol: 30, joint: 'elbow', tip: 'Keep your elbows up at shoulder height as you pull.' },
      { id: 'still', label: 'No body swing', feature: 'lean', stat: 'range', op: '<=', target: 10, tol: 15, joint: 'hip', tip: 'Stand still and let your rear shoulders do the work.' },
      TEMPO(),
    ],
  },
  rearFly: {
    view: 'front',
    setup: 'Put your phone in front of you at chest height, about 6 ft away, with both arms in frame.',
    primary: { feature: 'spread', dir: 'up', minRom: 0.4 },
    joints: ['shoulder', 'elbow', 'wrist'],
    checks: [
      { id: 'open', label: 'Arms open wide', feature: 'spread', stat: 'max', op: '>=', target: 2.3, tol: 1, unit: '×', joint: 'wrist', tip: 'Open your arms further, out to your sides in line with your shoulders.' },
      { id: 'bend', label: 'Arms stay long', feature: 'elbow', stat: 'min', op: '>=', target: 140, tol: 35, joint: 'elbow', tip: 'Keep a slight bend in your elbows and hold it. Don’t bend your arms to pull the weight.' },
      TEMPO(),
    ],
  },
  fly: {
    view: 'front',
    setup: 'Put your phone in front of you at chest height, about 6 ft away, with both arms in frame.',
    primary: { feature: 'spread', dir: 'down', minRom: 0.4 },
    joints: ['shoulder', 'elbow', 'wrist'],
    checks: [
      { id: 'squeeze', label: 'Hands meet', feature: 'spread', stat: 'min', op: '<=', target: 0.9, tol: 0.8, unit: '×', joint: 'wrist', tip: 'Bring your hands together in front of your chest and squeeze.' },
      { id: 'stretch', label: 'Full stretch', feature: 'spread', stat: 'max', op: '>=', target: 2.0, tol: 0.8, unit: '×', joint: 'wrist', tip: 'Open up wider to get a full chest stretch at the start.' },
      { id: 'bend', label: 'Same elbow bend', feature: 'elbow', stat: 'range', op: '<=', target: 25, tol: 25, joint: 'elbow', tip: 'Hold the same slight elbow bend the whole time. Don’t turn it into a press.' },
      TEMPO(),
    ],
  },
  lateralRaise: {
    view: 'front',
    setup: 'Put your phone in front of you at chest height, about 6–8 ft away, with your hips and both arms in frame.',
    primary: { feature: 'shoulder', dir: 'up', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'height', label: 'Up to shoulder height', feature: 'shoulder', stat: 'max', op: '>=', target: 75, tol: 30, joint: 'elbow', tip: 'Raise your arms higher, until they’re level with your shoulders.' },
      { id: 'tooHigh', label: 'Not too high', feature: 'shoulder', stat: 'max', op: '<=', target: 110, tol: 25, joint: 'shoulder', tip: 'Stop at shoulder height. Going higher shifts the work to your traps.' },
      { id: 'bend', label: 'Soft elbows', feature: 'elbow', stat: 'min', op: '>=', target: 140, tol: 35, joint: 'elbow', tip: 'Keep your arms nearly straight, with only a soft bend.' },
      { id: 'still', label: 'No swinging', feature: 'lean', stat: 'range', op: '<=', target: 10, tol: 12, joint: 'hip', tip: 'Don’t swing your body. Go lighter and lift with your shoulders.' },
      TEMPO(),
    ],
  },
  curl: {
    view: 'side',
    setup: 'Put your phone to your side at waist height, about 6 ft away, with your arm and torso in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'squeeze', label: 'Full curl', feature: 'elbow', stat: 'min', op: '<=', target: 55, tol: 30, joint: 'elbow', tip: 'Curl all the way up and squeeze at the top.' },
      { id: 'stretch', label: 'Full extension', feature: 'elbow', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'elbow', tip: 'Lower all the way down until your arm is straight.' },
      { id: 'pinned', label: 'Elbows pinned', feature: 'shoulder', stat: 'range', op: '<=', target: 20, tol: 20, joint: 'shoulder', tip: 'Keep your upper arm still at your side. Your elbow is drifting forward.' },
      { id: 'still', label: 'No body swing', feature: 'lean', stat: 'range', op: '<=', target: 8, tol: 12, joint: 'hip', tip: 'Stand still. Don’t swing your body to curl the weight.' },
      TEMPO(),
    ],
  },
  pushdown: {
    view: 'side',
    setup: 'Put your phone to your side at waist height, about 6 ft away, with your arm and torso in frame.',
    primary: { feature: 'elbow', dir: 'up', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist', 'hip'],
    checks: [
      { id: 'lockout', label: 'Full lockout', feature: 'elbow', stat: 'max', op: '>=', target: 160, tol: 25, joint: 'elbow', tip: 'Push down until your arms are completely straight and squeeze your triceps.' },
      { id: 'return', label: 'Full return', feature: 'elbow', stat: 'min', op: '<=', target: 95, tol: 30, joint: 'elbow', tip: 'Let your hands come back up to about chest height each rep.' },
      { id: 'pinned', label: 'Elbows pinned', feature: 'shoulder', stat: 'range', op: '<=', target: 20, tol: 20, joint: 'shoulder', tip: 'Keep your elbows tucked at your sides. Only your forearms should move.' },
      { id: 'still', label: 'No body swing', feature: 'lean', stat: 'range', op: '<=', target: 10, tol: 12, joint: 'hip', tip: 'Don’t lean into it. Keep your torso still.' },
      TEMPO(),
    ],
  },
  overheadExtension: {
    view: 'side',
    setup: 'Put your phone to your side, about 6 ft away, so your arms overhead are in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist'],
    checks: [
      { id: 'stretch', label: 'Deep stretch', feature: 'elbow', stat: 'min', op: '<=', target: 80, tol: 30, joint: 'elbow', tip: 'Lower the weight further behind your head for a full stretch.' },
      { id: 'lockout', label: 'Full lockout', feature: 'elbow', stat: 'max', op: '>=', target: 155, tol: 25, joint: 'elbow', tip: 'Straighten your arms all the way at the top.' },
      { id: 'pinned', label: 'Elbows still', feature: 'shoulder', stat: 'range', op: '<=', target: 20, tol: 20, joint: 'shoulder', tip: 'Keep your elbows pointing up and still. Only your forearms move.' },
      TEMPO(),
    ],
  },
  skullCrusher: {
    view: 'side',
    setup: 'Prop your phone to your side, level with the bench, with your arms in frame.',
    primary: { feature: 'elbow', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'elbow', 'wrist'],
    checks: [
      { id: 'stretch', label: 'Full depth', feature: 'elbow', stat: 'min', op: '<=', target: 80, tol: 30, joint: 'elbow', tip: 'Lower the bar down toward your forehead (or just behind it).' },
      { id: 'lockout', label: 'Full lockout', feature: 'elbow', stat: 'max', op: '>=', target: 155, tol: 25, joint: 'elbow', tip: 'Straighten your arms fully at the top.' },
      { id: 'pinned', label: 'Upper arms still', feature: 'shoulder', stat: 'range', op: '<=', target: 20, tol: 20, joint: 'shoulder', tip: 'Keep your upper arms still. Don’t let your elbows swing back and forth.' },
      TEMPO(),
    ],
  },
  squat: {
    view: 'side',
    setup: 'Put your phone to your side at hip height, about 8 ft away, with your whole body, feet to head, in frame.',
    primary: { feature: 'knee', dir: 'down', minRom: 25 },
    joints: ['hip', 'knee', 'ankle', 'shoulder'],
    checks: [
      { id: 'depth', label: 'Depth', feature: 'knee', stat: 'min', op: '<=', target: 100, tol: 30, joint: 'knee', tip: 'Squat deeper, until your thighs are at least parallel to the floor.' },
      { id: 'lockout', label: 'Stand all the way up', feature: 'knee', stat: 'max', op: '>=', target: 160, tol: 20, joint: 'knee', tip: 'Stand all the way up and lock your hips and knees at the top.' },
      { id: 'chest', label: 'Chest up', feature: 'lean', stat: 'peak', op: '<=', target: 50, tol: 20, joint: 'hip', tip: 'Keep your chest up. You’re folding forward at the bottom, so brace harder and sit back and down.' },
      TEMPO(),
    ],
  },
  legPress: {
    view: 'side',
    setup: 'Put your phone to the side of the machine, about 6–8 ft away, with your hips and legs in frame.',
    primary: { feature: 'knee', dir: 'down', minRom: 25 },
    joints: ['hip', 'knee', 'ankle'],
    checks: [
      { id: 'depth', label: 'Depth', feature: 'knee', stat: 'min', op: '<=', target: 95, tol: 30, joint: 'knee', tip: 'Lower the sled further, until your knees reach about 90°.' },
      { id: 'lockout', label: 'Full press', feature: 'knee', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'knee', tip: 'Press until your legs are almost straight.' },
      { id: 'back', label: 'Hips on the pad', feature: 'hip', stat: 'min', op: '>=', target: 55, tol: 25, joint: 'hip', tip: 'Don’t go so deep that your lower back rolls off the pad. Stop just before.' },
      TEMPO(),
    ],
  },
  lunge: {
    view: 'side',
    setup: 'Put your phone to your side at hip height, about 8–10 ft away, with your whole body in frame.',
    primary: { feature: 'kneeMin', dir: 'down', minRom: 25 },
    joints: ['hip', 'knee', 'ankle', 'shoulder'],
    checks: [
      { id: 'depth', label: 'Depth', feature: 'kneeMin', stat: 'min', op: '<=', target: 100, tol: 30, joint: 'knee', tip: 'Go lower, until your front knee is at about 90° and your back knee nearly touches the floor.' },
      { id: 'upright', label: 'Upright torso', feature: 'lean', stat: 'peak', op: '<=', target: 30, tol: 20, joint: 'hip', tip: 'Keep your chest up and torso tall, not folded over your front leg.' },
      { id: 'lockout', label: 'Stand tall', feature: 'kneeMin', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'knee', tip: 'Drive all the way up between reps.' },
      TEMPO(),
    ],
  },
  legExtension: {
    view: 'side',
    setup: 'Put your phone to the side of the machine, about 6 ft away, with your hips and legs in frame.',
    primary: { feature: 'knee', dir: 'up', minRom: 25 },
    joints: ['hip', 'knee', 'ankle'],
    checks: [
      { id: 'lockout', label: 'Full extension', feature: 'knee', stat: 'max', op: '>=', target: 160, tol: 25, joint: 'knee', tip: 'Straighten your legs all the way and squeeze your quads at the top.' },
      { id: 'return', label: 'Full return', feature: 'knee', stat: 'min', op: '<=', target: 100, tol: 30, joint: 'knee', tip: 'Lower the pad back to about 90° each rep.' },
      { id: 'seated', label: 'Hips stay down', feature: 'hip', stat: 'range', op: '<=', target: 12, tol: 15, joint: 'hip', tip: 'Stay seated. Your hips are lifting off the seat, so go a little lighter.' },
      TEMPO(),
    ],
  },
  legCurl: {
    view: 'side',
    setup: 'Put your phone to the side of the machine, about 6 ft away, with your hips and legs in frame.',
    primary: { feature: 'knee', dir: 'down', minRom: 25 },
    joints: ['hip', 'knee', 'ankle'],
    checks: [
      { id: 'squeeze', label: 'Full curl', feature: 'knee', stat: 'min', op: '<=', target: 75, tol: 30, joint: 'knee', tip: 'Curl further, bringing your heels toward your glutes.' },
      { id: 'stretch', label: 'Full stretch', feature: 'knee', stat: 'max', op: '>=', target: 150, tol: 25, joint: 'knee', tip: 'Let your legs straighten all the way between reps.' },
      { id: 'hips', label: 'Hips still', feature: 'hip', stat: 'range', op: '<=', target: 12, tol: 15, joint: 'hip', tip: 'Keep your hips pressed down on the pad. Don’t lift them to finish the rep.' },
      TEMPO(),
    ],
  },
  calfRaise: {
    view: 'side',
    setup: 'Put your phone to your side at knee height, about 5 ft away, with your feet and knees in frame.',
    primary: { feature: 'ankle', dir: 'up', minRom: 12 },
    joints: ['knee', 'ankle', 'foot'],
    checks: [
      { id: 'rom', label: 'Full range', feature: 'ankle', stat: 'range', op: '>=', target: 25, tol: 15, joint: 'ankle', tip: 'Go all the way up on your toes and all the way down for a full stretch.' },
      { id: 'knees', label: 'No knee bounce', feature: 'knee', stat: 'range', op: '<=', target: 10, tol: 12, joint: 'knee', tip: 'Keep your knees still. Don’t bounce them to push the weight up.' },
      TEMPO(1.5),
    ],
  },
  rdl: {
    view: 'side',
    setup: 'Put your phone to your side at hip height, about 8 ft away, with your whole body in frame.',
    primary: { feature: 'hip', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'hip', 'knee', 'ankle'],
    checks: [
      { id: 'hinge', label: 'Deep hinge', feature: 'hip', stat: 'min', op: '<=', target: 110, tol: 30, joint: 'hip', tip: 'Push your hips back further until you feel a big hamstring stretch.' },
      { id: 'knees', label: 'Soft, fixed knees', feature: 'knee', stat: 'min', op: '>=', target: 140, tol: 25, joint: 'knee', tip: 'Don’t bend your knees so much. This isn’t a squat, so push your hips back instead.' },
      { id: 'lockout', label: 'Hips through', feature: 'hip', stat: 'max', op: '>=', target: 160, tol: 20, joint: 'hip', tip: 'Stand all the way up and squeeze your glutes at the top.' },
      TEMPO(),
    ],
  },
  hipThrust: {
    view: 'side',
    setup: 'Put your phone to your side at bench height, about 6–8 ft away, with your shoulders to feet in frame.',
    primary: { feature: 'hip', dir: 'up', minRom: 25 },
    joints: ['shoulder', 'hip', 'knee', 'ankle'],
    checks: [
      { id: 'lockout', label: 'Full lockout', feature: 'hip', stat: 'max', op: '>=', target: 165, tol: 25, joint: 'hip', tip: 'Drive your hips all the way up until your body is flat from shoulders to knees, then squeeze.' },
      { id: 'shins', label: 'Shins vertical at top', feature: 'knee', stat: 'peak', op: 'between', target: [75, 110], tol: 25, joint: 'knee', tip: 'Move your feet so your knees are at about 90° at the top.' },
      { id: 'rom', label: 'Full range', feature: 'hip', stat: 'min', op: '<=', target: 120, tol: 30, joint: 'hip', tip: 'Lower your hips further between reps.' },
      TEMPO(),
    ],
  },
  legRaise: {
    view: 'side',
    setup: 'Put your phone to your side, about 8 ft away, with your whole body in frame.',
    primary: { feature: 'hip', dir: 'down', minRom: 25 },
    joints: ['shoulder', 'hip', 'knee'],
    checks: [
      { id: 'height', label: 'Legs high enough', feature: 'hip', stat: 'min', op: '<=', target: 100, tol: 30, joint: 'hip', tip: 'Raise your legs to at least hip height.' },
      { id: 'still', label: 'No swinging', feature: 'lean', stat: 'range', op: '<=', target: 15, tol: 15, joint: 'shoulder', tip: 'Stop swinging. Pause at the bottom and lift with your abs.' },
      TEMPO(),
    ],
  },
  crunch: {
    view: 'side',
    setup: 'Put your phone to your side at hip height, about 6 ft away.',
    primary: { feature: 'hip', dir: 'down', minRom: 20 },
    joints: ['shoulder', 'hip', 'knee'],
    checks: [
      { id: 'rom', label: 'Full crunch', feature: 'hip', stat: 'range', op: '>=', target: 30, tol: 20, joint: 'hip', tip: 'Crunch down further, curling your ribs toward your hips.' },
      TEMPO(),
    ],
  },
  plank: {
    view: 'side',
    setup: 'Put your phone to your side at floor height, about 6–8 ft away, with your head to feet in frame.',
    static: true,
    joints: ['shoulder', 'hip', 'ankle'],
    checks: [
      { id: 'line', label: 'Straight body line', feature: 'body', stat: 'avg', op: 'between', target: [165, 195], tol: 20, joint: 'hip', tip: '' },
      { id: 'hold', label: 'Hold time', feature: 'time', stat: 'value', op: '>=', target: 45, tol: 35, unit: 's', weight: 0.5, joint: 'shoulder', tip: 'Work up to holding for 45–60 seconds.' },
    ],
  },
  general: {
    view: 'side',
    setup: 'Put your phone to your side, about 6–8 ft away, with the moving joints in frame.',
    primary: { feature: 'auto', dir: 'any', minRom: 25 },
    joints: ['shoulder', 'elbow', 'hip', 'knee'],
    checks: [
      { id: 'rom', label: 'Full range of motion', feature: 'auto', stat: 'range', op: '>=', target: 60, tol: 40, joint: 'elbow', tip: 'Use a fuller range of motion, all the way down and all the way up.' },
      { id: 'still', label: 'Body stays still', feature: 'lean', stat: 'range', op: '<=', target: 10, tol: 15, joint: 'hip', tip: 'Keep your torso still so the target muscle does the work.' },
      TEMPO(),
    ],
  },
};

// Exercise name → rule set. Checked in order, first match wins.
const MATCHERS = [
  [/plank/i, 'plank'],
  [/crunch/i, 'crunch'],
  [/leg raise|knee raise/i, 'legRaise'],
  [/calf/i, 'calfRaise'],
  [/romanian|rdl|stiff/i, 'rdl'],
  [/hip thrust|glute bridge/i, 'hipThrust'],
  [/leg curl/i, 'legCurl'],
  [/leg extension|single-leg extension/i, 'legExtension'],
  [/leg press|hack squat/i, 'legPress'],
  [/lunge|split squat|step/i, 'lunge'],
  [/squat/i, 'squat'],
  [/skull/i, 'skullCrusher'],
  [/overhead.*(tricep|extension)/i, 'overheadExtension'],
  [/pushdown|kickback/i, 'pushdown'],
  [/curl/i, 'curl'],
  [/face pull/i, 'facePull'],
  [/reverse pec|rear delt/i, 'rearFly'],
  [/fly|flye|crossover|pec deck/i, 'fly'],
  [/lateral raise|front raise/i, 'lateralRaise'],
  [/pull-?up|chin-?up|pulldown|pullover/i, 'pulldown'],
  [/barbell row/i, 'bentRow'],
  [/row/i, 'row'],
  [/dip/i, 'dip'],
  [/shoulder press|overhead press|arnold|military/i, 'overheadPress'],
  [/press|bench/i, 'flatPress'],
];

export function templateFor(name) {
  for (const [re, key] of MATCHERS) if (re.test(name)) return { key, ...TEMPLATES[key] };
  return { key: 'general', ...TEMPLATES.general };
}

const fs = require('fs');
const src = fs.readFileSync('E:/开发/g-core/src/objects/GCore/GCore.tsx', 'utf8');
// Add debug logs
const modified = src
  .replace(
    'useEffect(() => {',
    'useEffect(() => {\n    console.log("[GCore] useEffect fired, groupRef:", !!groupRef.current);'
  )
  .replace(
    'group.scale.set(0, 0, 0)',
    'console.log("[GCore] resetting group to hidden state");\n    group.scale.set(0, 0, 0)'
  )
  .replace(
    'playEntrance(group, () => {})',
    'console.log("[GCore] playEntrance called"); playEntrance(group, () => { console.log("[GCore] animation complete"); })'
  )
  .replace(
    'clearTimeout(timer)',
    'console.log("[GCore] cleanup"); clearTimeout(timer)'
  );
fs.writeFileSync('E:/开发/g-core/src/objects/GCore/GCore.tsx', modified, 'utf8');
console.log('Done. Modified file length:', modified.length);

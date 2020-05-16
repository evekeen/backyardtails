const KILLED = [
  'has been brutally murdered',
  'was found stabbed in a bathroom',
  'was found dead in a dumpster',
  'did not survive a bar fight',
]

const SUICIDE = [
  'has opened own veins',
  'jumped from the bridge',
  'took too much sleeping pills',
]

function randomText(collection: string[]) {
  const index = Math.floor(Math.random() * collection.length);
  return collection[index];
}

export const nextKilledText = () => randomText(KILLED);
export const nextSuicideText = () => randomText(SUICIDE);
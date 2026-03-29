export const BIRDS = [
  `albatross`, `bunting`, `cardinal`, `chickadee`, `condor`, `cormorant`,
  `crane`, `crow`, `cuckoo`, `dove`, `duck`, `dunlin`, `eagle`, `egret`,
  `falcon`, `finch`, `flamingo`, `flicker`, `gannet`, `godwit`, `goose`,
  `grackle`, `grebe`, `grosbeak`, `grouse`, `gull`, `hawk`, `heron`,
  `hoopoe`, `ibis`, `jackdaw`, `jay`, `kestrel`, `kingfisher`, `kite`,
  `lark`, `linnet`, `loon`, `magpie`, `mallard`, `martin`, `merlin`,
  `moorhen`, `nighthawk`, `nuthatch`, `oriole`, `osprey`, `owl`, `oystercatcher`,
  `pelican`, `petrel`, `pheasant`, `pigeon`, `pipit`, `plover`, `puffin`,
  `raven`, `redstart`, `robin`, `sandpiper`, `shearwater`, `siskin`,
  `skimmer`, `skua`, `snipe`, `sparrow`, `starling`, `stork`, `swallow`,
  `swan`, `swift`, `tanager`, `teal`, `tern`, `thrush`, `tit`,
  `towhee`, `turnstone`, `vireo`, `vulture`, `warbler`, `waxwing`,
  `wheatear`, `whimbrel`, `widgeon`, `woodpecker`, `wren`, `yellowthroat`,
];

export const ADJECTIVES = [
  `adventurous`, `agile`, `ambitious`, `amiable`, `bold`, `brave`,
  `bright`, `brilliant`, `calm`, `capable`, `cheerful`, `clever`,
  `courageous`, `creative`, `curious`, `daring`, `dazzling`, `devoted`,
  `diligent`, `eager`, `earnest`, `energetic`, `fearless`, `focused`,
  `free`, `friendly`, `gentle`, `gifted`, `gleaming`, `glowing`,
  `golden`, `graceful`, `hardy`, `hopeful`, `humble`, `inspired`,
  `inventive`, `joyful`, `keen`, `kind`, `lively`, `luminous`,
  `mighty`, `nimble`, `noble`, `open`, `optimistic`, `patient`,
  `playful`, `proud`, `quick`, `radiant`, `resilient`, `resourceful`,
  `serene`, `shining`, `sincere`, `skillful`, `soaring`, `spirited`,
  `steady`, `strong`, `swift`, `tenacious`, `thoughtful`, `thriving`,
  `vibrant`, `vivid`, `warm`, `wise`, `witty`, `wonderful`, `zealous`,
];

/**
 * Generate a random adjective-bird project name.
 */
export function randomProjectName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const bird = BIRDS[Math.floor(Math.random() * BIRDS.length)];
  return `${adj}-${bird}`;
}

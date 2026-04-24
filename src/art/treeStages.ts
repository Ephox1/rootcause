const GRID_W = 48;
const GRID_H = 48;

const BLANK = ' '.repeat(GRID_W);

function padRow(row: string): string {
  return (row + BLANK).slice(0, GRID_W);
}

function build(rows: string[]): string[] {
  const out = rows.map(padRow);
  while (out.length < GRID_H) out.unshift(BLANK);
  return out.slice(-GRID_H);
}

// Legend:
//  '1' leafDeep   '2' leafDark   '3' leaf      '4' leafMid
//  '5' leafLt     '6' leafHi     '7' leafSpec
//  'D' trunkDark  'T' trunk      't' trunkLt   'b' bark   's' trunkShadow

const GROUND = [
  '                                                ',
  '                   ssssssssss                   ',
  '                 ssssssssssssss                 ',
];

// Stage 0 — Cracked seed in soil
const STAGE_0 = build([
  ...Array(40).fill(BLANK),
  '                      ss                        ',
  '                     sbbs                       ',
  '                     btTb                       ',
  '                     sDDs                       ',
  '                      ss                        ',
  ...GROUND,
]);

// Stage 1 — Sprout, two tiny leaves
const STAGE_1 = build([
  ...Array(34).fill(BLANK),
  '                    5   5                       ',
  '                   454 454                      ',
  '                   3443443                      ',
  '                    233 32                      ',
  '                     TtT                        ',
  '                     TtT                        ',
  '                     TTT                        ',
  '                    DTtTD                       ',
  '                     ssss                       ',
  ...GROUND,
]);

// Stage 2 — Sapling
const STAGE_2 = build([
  ...Array(28).fill(BLANK),
  '                    35553                       ',
  '                  2345665432                    ',
  '                 223466766322                   ',
  '                 234567776543                   ',
  '                  23456665432                   ',
  '                   2344443 2                    ',
  '                    22332                       ',
  '                     TtT                        ',
  '                     TTt                        ',
  '                     tTT                        ',
  '                     TtT                        ',
  '                     TTt                        ',
  '                    DTtTD                       ',
  '                   DDTTtTD                      ',
  ...GROUND,
]);

// Stage 3 — Young tree
const STAGE_3 = build([
  ...Array(18).fill(BLANK),
  '               2333      3332                   ',
  '             223454322  234543322               ',
  '            23456665432 3456665432              ',
  '           234567776654234567766432             ',
  '           345678877654345678766543             ',
  '           234567666543234567665432             ',
  '            23456554322234555443322             ',
  '             2334322    23342332                ',
  '              233        2332                   ',
  '               1  2     2  1                    ',
  '                  Tt   T                        ',
  '                  Tt Tt                         ',
  '                  TT TT                         ',
  '                  TTTTt                         ',
  '                  TtTT                          ',
  '                  TTT                           ',
  '                 DTtTD                          ',
  '                DDTTtTDD                        ',
  ...GROUND,
]);

// Stage 4 — Full tree
const STAGE_4 = build([
  ...Array(10).fill(BLANK),
  '          23332      233       3332             ',
  '        223454322   23454322 2234543322          ',
  '       2345666543  234566654323456665432         ',
  '      23456777665 2345677766532345677665432      ',
  '     234567888766234567887776643456788766543     ',
  '     345678887766345678887776634567888776543     ',
  '     234567887765234567887765434567887766532     ',
  '      2345677665423456777664322345677665432      ',
  '       234566554  234566554 22345666554322       ',
  '        23344322   2334422   234455443322        ',
  '         22332      2332       2334322           ',
  '          22         22         2232             ',
  '                   Tt                            ',
  '                1  Tt   1                        ',
  '                T Tt T                           ',
  '                TtTt T                           ',
  '                TTTtT                            ',
  '                 TTTt                            ',
  '                 TtTT                            ',
  '                 TTTt                            ',
  '                DTtTD                            ',
  '               DDTTtTDD                          ',
  '              DDDTtTTtDDD                        ',
  ...GROUND,
]);

// Stage 5 — In full bloom (large canopy, layered)
const STAGE_5 = build([
  ...Array(2).fill(BLANK),
  '          23332      233       3332             ',
  '        223454322   23454322 2234543322          ',
  '       2345666543  234566654323456665432         ',
  '      234567776652345677766523456777665432       ',
  '     2345678887765345678887766534567888776532    ',
  '    234567888877654345678888776545678888776543   ',
  '   23456788887766543456788887766534567888776532  ',
  '   23456788776654323456778877653234567887765322  ',
  '   23456777665432323456777665432234567766543222  ',
  '    234566665432  234566665432  234566665432     ',
  '     2345555432    23455554322 2345555543222     ',
  '      23344332      233443322   23344432322      ',
  '       223322        22332       223322          ',
  '         22           22           22            ',
  '                     Tt                          ',
  '                   1 Tt 1                        ',
  '                  T  Tt  T                       ',
  '                  Tt Tt Tt                       ',
  '                   T Tt T                        ',
  '                   TtTt Tt                       ',
  '                    TTTtT                        ',
  '                    TtTTt                        ',
  '                    TTTTt                        ',
  '                    TtTT                         ',
  '                   DTtTD                         ',
  '                  DDTtTtDD                       ',
  '                 DDDTTtTTDDD                     ',
  '                DDDDtTTtTtDDDD                   ',
  ...GROUND,
]);

export const TREE_STAGES: readonly string[][] = [
  STAGE_0,
  STAGE_1,
  STAGE_2,
  STAGE_3,
  STAGE_4,
  STAGE_5,
];

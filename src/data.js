export const STORES = ['Amazon', 'Walmart', 'Dollar Tree', 'Other']
export const SUPPLIES = ['Hot glue gun','Hot glue sticks','Clear Gorilla tape','Alien tape (nano double-sided)','Clear tape','Safety pins','Push pins','Rubber bands','Zip ties','Fishing line','Command hooks','Cardstock','Scissors','Balloon pump','Double-sided tape','String / twine','Glue dots','Poster putty','Batteries (AA/AAA)','Markers / Sharpies','Poster board','Garbage bags (large)']
const blank = () => ({ idea: { title: '', description: '', links: [] }, shopping: [], supplies: [], prep: [], night: [], gifts: { Rocky: '', Lia: '' }, message: { type: 'None', text: '' }, memories: { notes: '', photos: [] } })
const it = (item, qty, store, price, own = false) => ({ id: Math.random().toString(36).slice(2), item, qty, store, price, actual: '', own })
const task = (t) => ({ id: Math.random().toString(36).slice(2), text: t, done: false })
export function defaultDays() {
  const d = {}
  for (let i = 1; i <= 24; i++) d[i] = blank()
  d[1] = {
    idea: { title: "Ellie & Ozzy's Grand Return", description: "A handmade WE'RE BACK! poster board backdrop sparkling with Dollar Tree tinsel and glued-on ornaments. Below it, a contained entryway pit (foam/poster board barrier) with white balloons as the bottom layer, a tray/liner, and jumbo marshmallows piled on top. Ellie wears a cardstock party hat; Ozzy holds the balloon pump like he did ALL the work. The elves bring Advent calendars: Rocky gets Sonic or Minecraft, Lia gets Fuggler or a dumpling squishy one. Rocky's House Elf Rules printable is posted nearby.", links: [] },
    shopping: [
      it('Rocky Advent calendar (Sonic or Minecraft)', 1, 'Amazon', 33),
      it('Lia Advent calendar (Fuggler or dumpling squishy)', 1, 'Amazon', 35),
      it('Poster board (white, 22x28)', 2, 'Dollar Tree', 1.5),
      it('Foam board (barrier)', 3, 'Dollar Tree', 1.5),
      it('Tinsel garland', 2, 'Dollar Tree', 1.5),
      it('Shatterproof ornaments pack', 2, 'Dollar Tree', 1.5),
      it('White balloons (pack)', 2, 'Dollar Tree', 1.5),
      it('Jumbo marshmallows (bag)', 2, 'Walmart', 2.5),
      it('Tray / plastic tablecloth liner', 1, 'Dollar Tree', 1.5),
    ],
    supplies: ['Hot glue gun','Hot glue sticks','Clear Gorilla tape','Cardstock','Balloon pump','Scissors','Garbage bags (large)','Markers / Sharpies','Poster putty'],
    prep: ['Inflate balloons and store in garbage bags','Open marshmallows into a separate bag','Pre-tape barrier boards together (fold flat)','Decorate WE\'RE BACK! backdrop (letters, tinsel, ornaments)','Make Ellie\'s cardstock party hat','Wrap Advent calendars','Print Rocky\'s House Elf Rules'].map(task),
    night: ['Set up the foam/poster board barrier in the entryway','Dump balloons inside as the bottom layer','Lay the tray/liner over the balloons','Pour jumbo marshmallows on top','Place the WE\'RE BACK! backdrop behind the pit','Place Ellie (party hat on) and Ozzy (holding the balloon pump)','Secure elves and backdrop with poster putty / Command hooks','Set out the wrapped Advent calendars and the Elf Rules printable'].map(task),
    gifts: { Rocky: 'Sonic or Minecraft Advent calendar (Amazon)', Lia: 'Fuggler or dumpling squishy Advent calendar (Amazon)' },
    message: { type: 'Printable', text: "Rocky's House Elf Rules (see Printables Studio)" },
    memories: { notes: '', photos: [] },
  }
  return d
}
export const KIDS = {
  Rocky: '7, believes! Roblox, Sonic, AI robots, stick figure fights, combat, spooky/horror',
  Lia: '13: TikTok rap, Sac/Bay rap, 2000s rap, Fugglers, dumpling squishies',
}

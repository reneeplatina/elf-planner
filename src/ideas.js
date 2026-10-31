const A = (title, description, kid = 'Both', date = '') => ({ title, description, kid, date, status: 'Approved' })
const M = (title, description = '', kid = 'Both') => ({ title, description, kid, date: '', status: 'Maybe' })
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const approved = [
  A('Grand Arrival Party', "Spectacular entrance near the front door: giant handmade WE'RE BACK! poster with ornaments and tinsel, contained party pit with white balloons under jumbo marshmallows, Ellie in a cardstock party hat, Ozzy holding the balloon pump, Advent calendars for both kids (Rocky: Sonic or Minecraft; Lia: Fuggler or dumpling squishy). Annual tradition.", 'Both', '1'),
  A('Haunted Christmas House', 'Walk-through haunted Christmas tunnel along the L-shaped dining room wall: black wall coverings, spiderwebs, fake spiders, red LEDs, creepy photos, spooky audio, life-size homemade creepy clown, Ellie and Ozzy working the attraction, candy bags at the end, ENTER IF YOU DARE entrance. Layout undecided. Safety: stable tunnel, clear exits, careful fog placement.', 'Both', '12'),
  A('Combat Gods Battle Arena', 'Freestanding ~4 ft giant stick-figure action scene: two oversized fighters mid-battle, flying kicks, red/blue energy effects, dramatic backdrop, removable health bars, elves controlling the action. Not a wrestling ring.', 'Rocky'),
  A('North Pole Poop Factory', 'Miniature factory producing candy/chocolate poop with funny manufacturing mishaps and an outrageous elf storyline. Keep edibles separate from craft materials.'),
  A('Mystery Cups Prize Game', 'Red cups hide prizes, candy, gift cards or challenges; kids lift or pick cups to discover surprises. Separate day from Giant Punch Wall.'),
  A('Fuggler Containment Breach', 'Fuggler lab where the monsters escaped: containment bins, warning labels, red lighting, evidence of the escape, Ellie and Ozzy overwhelmed.', 'Lia'),
  A('Elf Horror Movie Premiere', 'Mini creepy movie theater: posters, tiny popcorn, red carpet, tickets. Optional real family movie night with an age-appropriate movie.'),
  A('Combat Gods Boss Battle', 'Sequel to the Battle Arena: a much larger stick-figure villain plus an interactive challenge. Reuse fighters and health bars, but make it feel genuinely different.', 'Rocky'),
  A('Giant Punch Wall', 'Large prize wall of tissue-covered cups; kids punch through to reveal prizes. Separate day from Mystery Cups.'),
  A('Christmas Tree Takeover', 'Ellie and Ozzy turned the Christmas tree into their HQ: mini ladders, platforms, rooms, elaborate elf activity.'),
  A('Giant Dice Challenge', 'Oversized dice decide challenges and prizes. Interactive and funny for both kids.'),
  A('The Midnight Snack Explosion', 'Contained but outrageous snack disaster: popcorn, cereal and treats exploded everywhere while the elves prepared a midnight feast.'),
  A('The Giant Christmas Jell-O Experiment', 'Oversized gelatin with gummy worms or other edible surprises to excavate, run as an elf laboratory.'),
  A('Everything in the House Has Eyes', 'Googly eyes on the fridge, bananas, containers, remotes and more; the fun is finding more all day.'),
  A('The Indoor Christmas Blizzard', 'One area transformed into an indoor winter scene: snowdrifts, snowflakes, winter lighting, toys buried in snow, elves responsible.'),
  A('Gingerbread House Day', 'Elves bring gingerbread house kits for Lia and Rocky to build and decorate together. A family activity, not just a display.'),
  A('North Pole Projection', 'Large immersive snowy North Pole village projected onto a wall.'),
  A('The Elves Sold Our Couch!', 'FOR SALE sign on the couch plus a second COUCH FOR SALE! sign outside the front of the home; elves act as sales agents. Keep it clearly playful so strangers don\'t think it\'s real.'),
  A('Take Us To See Christmas Lights!', 'Elves sit in a clear container with the note TAKE US ON A DRIVE TO LOOK AT LIGHTS! The family takes them on an evening drive to see lights.'),
]
const maybe = [M('North Pole Carnival'), M('Chocolate Crime Scene'), M('Spider Invasion'), M('Minute-to-Win-It Championship'), M('Guess That Rap Intro', '', 'Lia'), M('Creepy Clown Photo Booth'), M('Sonic Ring Hunt', '', 'Rocky'),
  M('Christmas Eve: The Ultimate Elf Party', 'Possible final Dec 24 event. Not approved; Christmas Eve experience still undecided.'),
  M('Giant Cardboard Stair Slide', 'Inspiration only. A real stair slide is a fall risk; consider a safer alternative later.')]
const rejected = ['Roblox Glitch Portal', 'North Pole Underground Rap Show', 'Elf Casino Night', 'AI Robot Factory', 'The Haunted Doll Hospital', 'Life-Size Mystery Vending Machine', 'North Pole Convenience Store', 'Elf Fart Laboratory', 'Zombie Christmas Outbreak', 'Abandoned North Pole Motel', 'Frozen Elf Rescue', 'Candy Conveyor Belt Disaster', 'Ghost Hunting Headquarters', 'Retro Video Game Arcade', 'North Pole Freak Show', 'Alien Abduction', 'Elf Food Delivery Disaster', 'North Pole Escape Room', 'The Elf Slasher Movie Set', 'Fuggler Mugshot Lineup', 'The 100-Layer Mystery Present', 'Christmas Tree Chainsaw Massacre', 'Real-Life Video Game Health Bar', 'The Candy Heist', 'The Human Claw Machine', 'Fuggler Christmas Dinner Disaster', 'Elf Body Swap Experiment', "Santa's Final Midnight Mission", 'The Great Living Room Gift-Wrapping Disaster', 'The Giant Balloon Avalanche', 'North Pole Snowball War', 'The Elves Built a Rocket Ship', 'The Elves Hijacked the Family Photos', 'The North Pole Racing Championship', 'The Elf Shrink-Ray Accident', 'The Great Stuffed Animal Rebellion', 'The Christmas Roller Coaster Disaster', 'The Giant Christmas Plinko Machine', 'The Great Sock Monster Invasion', "The World's Worst Christmas Bakery", 'The Secret North Pole Door'].map(t => ({ title: t, description: '', kid: 'Both', date: '', status: 'Rejected' }))
export const SEED_IDEAS = [...approved, ...maybe, ...rejected].map(x => ({ id: slug(x.title), ...x }))
// Add any seed ideas missing from saved data (by id); never overwrite saved ones.
export const mergeSeeds = saved => { const have = new Set(saved.map(x => x.id)); return [...saved, ...SEED_IDEAS.filter(x => !have.has(x.id))] }
export const KIDS = {
  Lia: { age: 13, loves: ['TikTok and internet culture', 'Sacramento & Bay Area underground/local rap', 'Some classic 2000s rap', 'Fugglers and odd collectibles', 'Funny horror, creepy aesthetics, Terrifier', 'Teen-appropriate prizes and surprises'], notes: ["Not a little kid: give her something to discover even on Rocky-themed days", 'Optional VIP surprises; no forced participation'] },
  Rocky: { age: 7, loves: ['Roblox', 'Sonic', 'Minecraft', 'Combat Gods / stick-figure fighting', 'Robots and tech', 'Fart and poop humor', 'Games, prizes and surprises'], notes: ['Very observant and wakes at night: install scenes carefully'] },
}

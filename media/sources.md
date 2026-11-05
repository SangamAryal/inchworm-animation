# Sources

## Images used on screen
| File | What | Source | Licence / credit |
|---|---|---|---|
| public/textures/earth-day.jpg | Earth surface map (Blue Marble) | NASA Visible Earth, via the `three-globe` npm package (example/img/earth-blue-marble.jpg) | Public domain (NASA). Credit: NASA Visible Earth |
| public/textures/earth-clouds.jpg | Earth cloud map | `three-globe` npm package (example/clouds/clouds.png), derived from NASA imagery | Credit: NASA |
| public/textures/moon.jpg | Moon colour map (LRO) | NASA SVS CGI Moon Kit, via the `globe.gl` npm package (example/moon-landing-sites/lunar_surface.jpg) | Public domain (NASA). Credit: NASA's Scientific Visualization Studio |

Mars, Neptune, Jupiter, the Sun, Betelgeuse, the neutron star and all black holes are drawn procedurally in shaders (src/bodies/shaders.ts). The black holes are ray-traced with Schwarzschild light bending.

## Facts (Short 01)
| Object | Value used | Source |
|---|---|---|
| Neutron star | ~20 km diameter | NASA Imagine the Universe, "Neutron Stars" |
| Moon, Mars, Earth, Neptune, Jupiter | equatorial diameters 3,475 / 6,792 / 12,756 / 49,528 / 142,984 km | NASA Planetary Fact Sheet (nssdc.gsfc.nasa.gov/planetary/factsheet) |
| Sun | 1,391,400 km (2 x 695,700 km) | NASA Sun Fact Sheet |
| Sagittarius A* | 4.3 million solar masses -> event horizon ~25.4 million km | GRAVITY Collaboration (2022); EHT (2022) |
| Betelgeuse | ~764 solar radii -> ~1.06 billion km | Joyce et al. 2020, ApJ 902, 63 |
| M87* | 6.5 billion solar masses -> event horizon ~38.4 billion km | Event Horizon Telescope Collaboration (2019) |
| TON 618 | ~40.7 billion solar masses -> event horizon ~240 billion km | Shemmer et al. 2004, ApJ 614, 547 |

Event-horizon diameter = 4GM/c^2 = 5.906 km per solar mass. Black-hole masses (especially TON 618) have large uncertainties.

## Facts (Short 02: mammal top speeds)
| Animal | Value used | Source |
|---|---|---|
| Asian elephant | 24 km/h (15 mph), ~6.7 m/s | Hutchinson, Famini, Lair & Kram (2003), "Are fast-moving elephants really running?", Nature 422, 493-494 |
| Human | 44.7 km/h (27.8 mph), 12.42 m/s | Usain Bolt's peak speed in the 9.58 s 100 m world record, Berlin 2009 (Graubner & Nixdorf 2011, IAAF biomechanical analysis, New Studies in Athletics 26) |
| Plains zebra | 49.7 km/h (30.9 mph), 13.8 m/s | Wilson et al. (2018), "Biomechanics of predator-prey arms race in lion, zebra, cheetah and impala", Nature 554, 183-188 (GPS collars on wild animals in Botswana; highest speed reached by three individuals) |
| Grizzly bear | 56 km/h (35 mph), the low end of 35-40 mph | US National Park Service, "Yellowstone Grizzly Bear Facts" (nps.gov/yell) |
| Impala | 63.7 km/h (39.6 mph), 17.7 m/s | Wilson et al. (2018), "Biomechanics of predator-prey arms race in lion, zebra, cheetah and impala", Nature 554, 183-188 (GPS collars on wild animals in Botswana; highest speed reached by three individuals) |
| Greyhound | 67.32 km/h (41.83 mph) | Guinness World Records, fastest greyhound (Star Title, Wyong, Australia, 5 March 1994) |
| Racehorse | 70.35 km/h (43.71 mph) | Guinness World Records, "Fastest speed for a racehorse" (Winning Brew, Penn National, 14 May 2008) |
| Lion | 74.2 km/h (46.1 mph), 20.6 m/s | Wilson et al. (2018), "Biomechanics of predator-prey arms race in lion, zebra, cheetah and impala", Nature 554, 183-188 (GPS collars on wild animals in Botswana; highest speed reached by three individuals) |
| Pronghorn | 88.5 km/h (55 mph) | US National Park Service, "Pronghorn" (nps.gov/articles/000/pronghorn.htm) |
| Cheetah | 93 km/h (58 mph), 25.9 m/s | Wilson et al. (2013), "Locomotion dynamics of hunting in wild cheetahs", Nature 498, 185-189 (GPS collars on wild cheetahs). Older figures of 104-120 km/h come from captive or less precise measurements. |
| Brazilian free-tailed bat | 160 km/h (99 mph), 44.5 m/s | McCracken et al. (2016), "Airplane tracking documents the fastest flight speeds recorded for bats", Royal Society Open Science 3, 160398 (ground speed in level flight) |

All animals are drawn in code (src/creatures/), no images. Music is synthesised in code (audio/make_beat.py); no sound effects.

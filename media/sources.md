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

## Short 04: how fast can a car go?

| Vehicle | Value used | Source |
|---|---|---|
| Benz Patent-Motorwagen (1886) | 16 km/h (10 mph) | Mercedes-Benz Classic, Benz Patent-Motorwagen vehicle data |
| Ford Model T (1908) | 72 km/h (45 mph), top of the 40-45 mph range | Ford Motor Company heritage, Model T facts |
| Volkswagen Beetle 1200, 34 PS (1960s) | 115 km/h (71 mph) | Volkswagen Newsroom, Beetle 1200 / 1200 L vehicle data |
| Ferrari F40 (1987) | 324 km/h (201 mph) | Ferrari, F40 official specifications |
| Formula 1 car | 372.5 km/h (231.5 mph) | Guinness World Records, "Fastest speed outright in a Formula One Grand Prix" (Valtteri Bottas, Williams, 2016) |
| McLaren F1 (1998) | 386.4 km/h (240.1 mph) | Guinness World Records production-car record, Ehra-Lessien, 31 March 1998 (Andy Wallace) |
| Bugatti Chiron Super Sport 300+ (2019) | 490.5 km/h (304.8 mph), 490.484 km/h one way | Bugatti press release, Ehra-Lessien, 2 August 2019 (Andy Wallace) |
| ThrustSSC (1997) | 1,228 km/h (763 mph), 1,227.985 km/h, Mach 1.02 | FIA World Land Speed Record, Black Rock Desert, 15 October 1997 (Andy Green) |

Profiles are drawn in code from published length, height, wheelbase and tyre size (src/vehicles/specs.ts). The F1 car has no team livery. The camera pulls back for ThrustSSC (16.5 m long); the scale bar changes from 1 m to 5 m.

## Short 05: how fast can a flying machine go?

| Machine | Value used | Source |
|---|---|---|
| Wright Flyer (1903) | 48 km/h (30 mph), estimated top speed | US National Park Service, "The Wright Flyer" (nps.gov/articles/wrightflyer.htm) |
| Ryan NYP "Spirit of St. Louis" (1927) | 214 km/h (133 mph), top speed | Ryan NYP specifications (Wikipedia, citing the Smithsonian National Air and Space Museum) |
| Supermarine Spitfire F Mk IX (1942) | 657 km/h (408 mph) at 25,000 ft | historyofwar.org, "Supermarine Spitfire Mk IX" (table; text gives 409 mph at 28,000 ft) |
| Boeing 747-400 | 907 km/h (564 mph): Mach 0.85 design cruise at 35,000 ft (ISA speed of sound 576 kt) | Boeing, "747-400 Airplane Characteristics for Airport Planning" (0.85 Mach cruise) |
| Concorde | 2,180 km/h (1,354 mph), Mach 2.04 cruise | Key.Aero, "Concorde" |
| Lockheed SR-71 Blackbird | 3,529.6 km/h (2,193.2 mph), absolute speed record, 28 July 1976 (Joersz and Morgan) | US Air Force, "SR-71 pilots, crew relive absolute speed record" (af.mil) |
| North American X-15A-2 | 7,274 km/h (4,520 mph), Mach 6.7, 3 October 1967 (Pete Knight) | US Air Force Life Cycle Management Center, "Flashback: X-15" |
| Space Shuttle orbiter | 28,000 km/h (17,500 mph), orbital speed | NASA Kennedy Space Center FAQ |

The 747 and Concorde figures are cruise speeds, the others are top or record speeds. Profiles are drawn in code from published lengths (src/aircraft/specs.ts), with no airline or squadron markings; each machine is drawn at its own scale so it fills the frame, and the scale bar shows the change. Earth seen from orbit uses public/textures/earth-strip.jpg, a crop of the NASA Blue Marble and cloud maps above. Background motion speed is compressed (v^0.55) so both 48 and 28,000 km/h read as motion.

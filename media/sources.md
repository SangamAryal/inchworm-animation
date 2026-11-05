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

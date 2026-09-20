import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = 'C:/Users/dcern/Pictures/Immagini per sito cavalcata';
const output = new URL('../public/photos/', import.meta.url);

const photos = [
  ['centro-storico', 'Centro storico - panorama 2014.jpg.jpeg'],
  ['centro-storico-2011', 'Centro storico - panorama 2011a.jpg.jpeg'],
  ['fontana', 'San Mango fontana e piazza 2013.jpg.jpeg'],
  ['san-vincenzo', 'cavalcata - chiesa di San Vincenzo.jpg.jpeg'],
  ['piazza-cavalcata', 'cavalcata 2017 Faella Chiara.JPG.jpeg'],
  ['chiesa-madre', 'chiesa Madre 2011.JPG.jpeg'],
  ['campanile', 'campanile 2006.jpg.jpeg'],
  ['chiesa-madre-2010', 'chiesa Madre 2010.tif'],
  ['ponte-2013', 'ponte romano detto di  Annibale 2013.JPG.jpeg'],
  ['ponte-acqua', 'ponte romano detto di  Annibale 2012 con acqua.jpg.jpeg'],
  ['ponte-2010', 'ponte romano detto di  Annibale 2010.jpg.jpeg'],
  ['ponte-2010a', 'ponte romano detto di  Annibale 2010a.TIF'],
  ['ponte-2018-acqua', 'ponte romano detto di  Annibale 2018 con acqua.TIF'],
  ['ponte-cavalcata-2011', 'ponte romano detto di  Annibale 2011 cavalcata.tif'],
  ['sant-anna-esterno', "chiesa di Sant'Anna 2021.JPG.jpeg"],
  ['sant-anna-1979', "chiesa di Sant'Anna 1979.JPG.jpeg"],
  ['sant-anna-2010', "chiesa di Sant'Anna 2010.TIF"],
  ['sant-anna-laterale', "chiesa Sant'Anna - vista laterale 2007.JPG.jpeg"],
  ['sant-anna-facciata', "chiesa Sant'Anna - facciata 2017.JPG.jpeg"],
  ['sant-anna-interno', "chiesa Sant'Anna - interno 2017.JPG.jpeg"],
  ['sant-anna-affresco', "chiesa Sant'Anna - affresco 2005a.JPG.jpeg"],
  ['sant-anna-affresco-intero', "chiesa Sant'Anna - affresco 2005.JPG.jpeg"],
  ['sant-anna-statue', "chiesa Sant'Anna - statue e panneggio.JPG.jpeg"],
  ['sant-anna-illuminazione', "chiesa Sant'Anna - illuminazione 2012.JPG.jpeg"],
  ['cavalcata-altare', 'cavalcata 2024 Martino Domenica 3 (2).JPG.jpeg'],
  ['cavalcata-cavalli', 'cavalcata 2024 Zarrella Sara.JPG.jpeg'],
  ['cavalcata-ponte', 'cavalcata 2014 Boccuzzi Teodoro 2.JPG.jpeg'],
  ['cavalcata-chiesa', 'cavalcata 2018 Giannitti Barbara.JPG.jpeg'],
  ['cavalcata-partenza', 'cavalcata 2025 Boccuzzi Teodoro.JPG.jpeg'],
  ['cavalcata-2018-teodoro', 'cavalcata 2018 Sibilia Teodoro.JPG.jpeg'],
  ['cavalcata-2022-serena', 'cavalcata 2022 Sibilia Serena.JPG.jpeg'],
  ['cavalcata-2024-federica', 'cavalcata 2024 Ingenito Federica 5.JPG.jpeg'],
  ['cavalcata-trombonieri', 'cavalcata - trombonieri di Cava 2016.JPG.jpeg'],
];

await mkdir(output, { recursive: true });
for (const [name, filename] of photos) {
  const info = await sharp(join(source, filename))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 79, effort: 5 })
    .toFile(fileURLToPath(new URL(`${name}.webp`, output)));
  console.log(`${name}.webp ${info.width}x${info.height} ${info.size} bytes`);
}

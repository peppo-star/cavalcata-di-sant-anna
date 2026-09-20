export type StagePhoto = {
  src: string;
  alt: string;
  caption: string;
};

export type StageStory = {
  id: string;
  shortName: string;
  title: string;
  lead: string;
  copy: string[];
  curiosity: string;
  curiosityLabel?: string;
  curiosityPhoto?: StagePhoto;
  end: number;
  photos: StagePhoto[];
};

export const segments: StageStory[] = [
  {
    id: 'partenza',
    shortName: 'Partenza',
    title: 'La partenza dal municipio',
    lead: 'Dal centro di San Mango sul Calore comincia il cammino dei cavalieri verso Sant’Anna.',
    copy: [
      'La Cavalcata è una festa della comunità: secondo le testimonianze raccolte, il corteo parte dal municipio ed è guidato dal sindaco, seguito da amministratori, cavalieri e cittadini. Gli abiti dei cavalieri, i cavalli e i confetti lanciati lungo il percorso trasformano per un giorno le strade di San Mango in una festa condivisa. Il paese accompagna i cavalli prima che il percorso si allontani dall’abitato.',
      'La ricorrenza si svolgeva tradizionalmente il 26 luglio, giorno di Sant’Anna. Dal 2006 la Cavalcata è stata fissata all’ultima domenica di luglio. Le fonti locali ne documentano la continuità almeno dalla fine dell’Ottocento e ricordano una fiera presso la chiesa già alla fine del Seicento.',
      'La festa unisce devozione e vita civile. Nella preparazione, le famiglie organizzano cavalli, abiti e confetti; poi il corteo attraversa il centro e si dirige verso la chiesa rurale. La documentazione sul patrimonio immateriale campano ricorda che la partecipazione a cavallo, un tempo prevalentemente maschile, si è aperta anche alle donne.',
    ],
    curiosity: 'La presenza del sindaco alla guida del corteo ricorda che la Cavalcata è anche un rito civico, oltre che religioso.',
    end: 0.026,
    photos: [
      { src: '/photos/cavalcata-partenza.webp', alt: 'Cavaliere in costume durante la Cavalcata', caption: 'Un cavaliere durante la Cavalcata, 2025.' },
      { src: '/photos/centro-storico.webp', alt: 'Panorama del centro abitato di San Mango sul Calore', caption: 'Il centro di San Mango sul Calore, 2014.' },
      { src: '/photos/centro-storico-2011.webp', alt: 'Panorama del centro abitato di San Mango sul Calore', caption: 'Una veduta del centro di San Mango sul Calore, 2011.' },
      { src: '/photos/cavalcata-cavalli.webp', alt: 'Cavallerizza e cavallo durante la Cavalcata', caption: 'La partecipazione dei cavalieri, 2024.' },
      { src: '/photos/cavalcata-2018-teodoro.webp', alt: 'Cavaliere in costume porge confetti durante la Cavalcata', caption: 'Lo scambio dei confetti con il pubblico, 2018.' },
      { src: '/photos/piazza-cavalcata.webp', alt: 'Giovane cavallerizza saluta durante la Cavalcata', caption: 'Un momento della Cavalcata nel centro abitato, 2017.' },
    ],
  },
  {
    id: 'fontana-monumentale',
    shortName: 'Fontana monumentale',
    title: 'La fontana e la piazza',
    lead: 'Nelle vie del paese, la Cavalcata attraversa luoghi della vita quotidiana e della memoria collettiva.',
    copy: [
      'La fontana è un punto riconoscibile della piazza: nel passaggio del corteo, lo spazio ordinario del paese diventa luogo di incontro e di festa. Qui il racconto del percorso si intreccia con i gesti di chi aspetta i cavalieri e li saluta.',
      'La Mnemoteca di San Mango ricorda quanto il terremoto del 1980 abbia cambiato edifici, strade e abitudini. Fotografie e toponimi aiutano a ritrovare la continuità tra il paese di ieri e quello di oggi.',
      'Guardare la piazza durante la Cavalcata significa vedere due tempi sovrapposti: quello quotidiano, fatto di incontri e passaggi, e quello della festa, in cui gli stessi luoghi diventano parte di una memoria comune. Le immagini storiche della Mnemoteca aiutano a riconoscere questa trasformazione.',
    ],
    curiosity: 'La Mnemoteca raccoglie fotografie, documenti e testimonianze per custodire la memoria di San Mango sul Calore.',
    end: 0.046,
    photos: [
      { src: '/photos/fontana-monumentale.webp', alt: 'Fontana monumentale in pietra con panorama collinare', caption: 'La fontana monumentale affacciata sulla valle.' },
    ],
  },
  {
    id: 'chiesa-san-vincenzo',
    shortName: 'Chiesa di San Vincenzo',
    title: 'La chiesa di San Vincenzo',
    lead: 'Alla Torre, il passaggio dei cavalli diventa uno dei momenti rituali della Cavalcata.',
    copy: [
      'La chiesa di San Vincenzo, ricordata anche come chiesa del Cimitero, è una delle soste più significative del percorso. Secondo la descrizione conservata nella Mnemoteca, i cavalieri compiono tre giri attorno alla chiesa prima di proseguire verso Sant’Anna.',
      'Lungo la strada i cavalieri lanciano confetti alla folla. Qui, come all’arrivo, il gesto rende visibile la partecipazione di tutti: chi cavalca, chi accompagna e chi attende il corteo.',
      'I confetti vengono preparati prima della festa e portati dai cavalieri in sacchetti da cui sono distribuiti lungo il tragitto. Il dono raggiunge le persone ai bordi della strada e rende il pubblico parte attiva della celebrazione.',
    ],
    curiosity: 'I tre giri attorno a San Vincenzo sono descritti nelle fonti locali come parte del rito della Cavalcata.',
    end: 0.085,
    photos: [
      { src: '/photos/san-vincenzo.webp', alt: 'Cavalcata e folla presso la chiesa di San Vincenzo', caption: 'La Cavalcata presso la chiesa di San Vincenzo.' },
      { src: '/photos/cavalcata-2022-serena.webp', alt: 'Cavallerizza e pubblico con le mani alzate', caption: 'Cavallerizza e pubblico durante la Cavalcata, 2022.' },
      { src: '/photos/cavalcata-2024-federica.webp', alt: 'Cavallerizza lancia confetti davanti alla folla', caption: 'Il lancio dei confetti tra le vie del paese, 2024.' },
    ],
  },
  {
    id: 'piazza-padre-pio',
    shortName: 'Piazza Padre Pio',
    title: 'Piazza Padre Pio',
    lead: 'La Croce e la statua di San Pio da Pietrelcina segnano uno spazio di devozione affacciato sulla valle.',
    copy: [
      'Piazza Padre Pio, indicata anche come Piazza San Pio da Pietrelcina, ospita il monumento dedicato al santo e alla Croce. La scheda di Tabernacoli italiani, pubblicata il 10 dicembre 2013, documenta questo luogo di devozione nel centro di San Mango sul Calore.',
      'Il Crocifisso si trova sulla parete in pietra del livello inferiore; le gradinate conducono alla terrazza con la statua di Padre Pio. I muretti e le ringhiere seguono il dislivello della piazza e aprono lo sguardo sul paesaggio della valle.',
      'La scheda riporta un’iscrizione datata 1997 e un pensiero attribuito a Padre Pio sul valore di un sorriso donato agli altri. Durante il passaggio della Cavalcata, questo spazio di raccoglimento entra nel percorso della festa e della comunità.',
    ],
    curiosityLabel: '',
    curiosity: 'La memoria locale lega questa tappa al luogo di una vecchia chiesa. Lo spazio di devozione dedicato a Padre Pio ne mantiene vivo il ricordo, attraverso la Croce e la statua.',
    end: 0.29,
    photos: [
      { src: '/photos/piazza-padre-pio-croce.webp', alt: 'Spazio in pietra con Croce e statua di Padre Pio', caption: 'La Croce e lo spazio panoramico dedicato a Padre Pio.' },
      { src: '/photos/piazza-padre-pio-statua.webp', alt: 'Statua di Padre Pio in uno spazio panoramico', caption: 'La statua di Padre Pio nella piazza panoramica.' },
    ],
  },
  {
    id: 'chiesa-madre',
    shortName: 'Chiesa Madre',
    title: 'La Chiesa Madre',
    lead: 'Il percorso passa accanto a un edificio che racconta anche la ricostruzione del paese.',
    copy: [
      'L’attuale Chiesa Madre è uno dei riferimenti del centro di San Mango sul Calore. La sua architettura contemporanea, con la grande vetrata e le fasce chiare della facciata, appartiene al paesaggio nato dopo il terremoto del 1980.',
      'La Mnemoteca ricorda che la chiesa e il campanile precedenti andarono perduti con il sisma. Le immagini dell’edificio attuale raccontano quindi una storia di continuità della comunità, ma anche di profondo cambiamento dei suoi luoghi.',
      'La fotografia del campanile e le vedute del centro mostrano come la ricostruzione abbia dato al paese nuovi punti di riferimento visivi. Nel percorso della Cavalcata, la Chiesa Madre aiuta a leggere insieme la devozione, la perdita e la capacità di ricominciare.',
    ],
    curiosity: 'Il campanile visibile nelle foto recenti non è quello della vecchia chiesa, distrutta dal terremoto. La campana oggi custodita all’interno del nuovo campanile è stata forgiata in parte con i resti della vecchia campana: il lavoro è stato realizzato dal Comune di Agnone, con cui il Comune di San Mango sul Calore è gemellato.',
    curiosityPhoto: { src: '/photos/campanile.webp', alt: 'Campanile della Chiesa Madre sopra gli alberi', caption: 'Il campanile della Chiesa Madre, 2006.' },
    end: 0.894,
    photos: [
      { src: '/photos/fontana.webp', alt: 'Fontana della piazza con la Chiesa Madre sullo sfondo', caption: 'La fontana della piazza con la Chiesa Madre sullo sfondo, 2013.' },
      { src: '/photos/chiesa-madre.webp', alt: 'Facciata della Chiesa Madre di San Mango sul Calore', caption: 'La Chiesa Madre, 2011.' },
      { src: '/photos/chiesa-madre-2010.webp', alt: 'Chiesa Madre di San Mango sul Calore in una fotografia del 2010', caption: 'La Chiesa Madre in una fotografia del 2010.' },
    ],
  },
  {
    id: 'ponte-annibale',
    shortName: 'Ponte di Annibale',
    title: 'Il ponte detto di Annibale',
    lead: 'Fuori dall’abitato, il paesaggio accompagna il corteo verso la chiesa rurale di Sant’Anna.',
    copy: [
      'Il ponte ad arco, comunemente chiamato «Ponte di Annibale», è uno dei segni più riconoscibili del territorio. Le fotografie lo mostrano in stagioni diverse, con il greto asciutto e con l’acqua sotto l’arcata.',
      'Il nome appartiene alla tradizione locale: non costituisce di per sé una prova di un passaggio di Annibale. Nel racconto della Cavalcata, il ponte introduce il tratto verso la valle e la meta finale, presso il Calore e il torrente Uccello.',
      'Il Comune descrive la struttura a dorso d’asino, con muratura di ciottoli, malta e mattoni, e la data al I secolo a.C.: una datazione posteriore alla vita del condottiero cartaginese. Nel rito della Cavalcata, il ponte segna il passaggio dal paese al paesaggio fluviale: le testimonianze ricordano una sosta dei cavalieri prima di proseguire verso Sant’Anna.',
    ],
    curiosity: 'Il nome «Ponte di Annibale» non prova che il celebre condottiero sia passato proprio su questa struttura: è molto improbabile che abbia calpestato esattamente questo ponte. Secondo una spiegazione tramandata localmente, «Annibale» potrebbe essere stato un vecchio proprietario del terreno. Da «ponte sul terreno di Annibale» sarebbe nata la forma d’uso «o’ ponte r’Annibale».',
    end: 0.999,
    photos: [
      { src: '/photos/ponte-2013.webp', alt: 'Ponte ad arco in pietra detto di Annibale', caption: 'Il ponte detto di Annibale, 2013.' },
      { src: '/photos/ponte-acqua.webp', alt: 'Ponte detto di Annibale con acqua sotto l’arcata', caption: 'Il ponte con l’acqua, 2012.' },
      { src: '/photos/ponte-2010.webp', alt: 'Ponte detto di Annibale fotografato nel 2010', caption: 'Il ponte detto di Annibale, 2010.' },
      { src: '/photos/ponte-2010a.webp', alt: 'Un’altra veduta del ponte detto di Annibale', caption: 'Un’altra veduta del ponte, 2010.' },
      { src: '/photos/ponte-2018-acqua.webp', alt: 'Ponte detto di Annibale con acqua', caption: 'Il ponte con l’acqua, 2018.' },
      { src: '/photos/ponte-cavalcata-2011.webp', alt: 'Immagine della Cavalcata presso il Ponte di Annibale', caption: 'La Cavalcata presso il ponte, 2011.' },
    ],
  },
  {
    id: 'chiesa-sant-anna',
    shortName: 'Chiesa di Sant’Anna',
    title: 'L’arrivo a Sant’Anna',
    lead: 'La chiesa rurale custodisce il gesto conclusivo e la memoria più antica della Cavalcata.',
    copy: [
      'Raggiunta la chiesa, il rito culmina nei tre giri e nell’ingresso dei cavalieri a cavallo davanti all’altare, mentre i confetti vengono lanciati ai presenti. Le fonti locali descrivono in modo diverso il punto esatto dei giri finali: attorno all’edificio o all’altare. È il momento in cui il percorso diventa pienamente rito.',
      'La chiesa di Sant’Anna ha origini medievali; uno studio citato nella documentazione locale la colloca nel XIII secolo. Conserva affreschi e una struttura a tre navate. Le immagini d’archivio, dagli anni Settanta a oggi, mostrano insieme la sua storia e la partecipazione della comunità.',
      'Una leggenda racconta di un nobile cavaliere che, dopo aver chiesto a Sant’Anna la nascita di un figlio, distribuì monete alla folla; i confetti ne avrebbero preso il posto. È una tradizione orale, distinta dalle attestazioni documentarie della fiera e della Cavalcata.',
      'Il Comune descrive Sant’Anna come uno dei pochi edifici gotici irpini conservati: quattro pilastri suddividono le tre navate e sostengono volte a sesto acuto. Sulla parete dell’altare, il panneggio dipinto incornicia la nicchia della statua; un affresco trecentesco raffigura Sant’Anna e una figura in preghiera. La chiesa fu consolidata e restaurata dopo il terremoto del 1980.',
      'Dal Ponte di Annibale il corteo raggiunge Sant’Anna anche lungo una stradina sterrata, come mostra la fotografia della Cavalcata del 2014. All’arrivo i cavalieri entrano nella chiesa, passano davanti all’altare e continuano il rito in un clima di musica e partecipazione. Le immagini degli interni e degli esterni raccontano gli incontri e la presenza della comunità negli anni.',
    ],
    curiosity: 'I «fichi di Sant’Anna», maturi intorno alla festa, sono un altro piccolo segno stagionale ricordato dalla tradizione locale.',
    end: 1,
    photos: [
      { src: '/photos/sant-anna-esterno.webp', alt: 'Chiesa rurale di Sant’Anna vista dall’alto', caption: 'La chiesa di Sant’Anna, 2021.' },
      { src: '/photos/sant-anna-1979.webp', alt: 'Fotografia storica della chiesa di Sant’Anna con persone', caption: 'Sant’Anna e la comunità in una fotografia del 1979.' },
      { src: '/photos/sant-anna-2010.webp', alt: 'Chiesa rurale di Sant’Anna in una fotografia del 2010', caption: 'La chiesa di Sant’Anna, 2010.' },
      { src: '/photos/sant-anna-laterale.webp', alt: 'Vista laterale della chiesa di Sant’Anna', caption: 'Una vista laterale della chiesa, 2007.' },
      { src: '/photos/sant-anna-facciata.webp', alt: 'Facciata della chiesa di Sant’Anna durante una festa', caption: 'La facciata della chiesa, 2017.' },
      { src: '/photos/sant-anna-interno.webp', alt: 'Interno della chiesa di Sant’Anna con visitatori', caption: 'L’interno della chiesa, 2017.' },
      { src: '/photos/sant-anna-affresco.webp', alt: 'Particolare di un affresco nella chiesa di Sant’Anna', caption: 'Un affresco conservato nella chiesa, fotografato nel 2005.' },
      { src: '/photos/sant-anna-affresco-intero.webp', alt: 'Veduta più ampia dell’affresco nella chiesa di Sant’Anna', caption: 'L’affresco in una veduta più ampia, 2005.' },
      { src: '/photos/sant-anna-statue.webp', alt: 'Statue e panneggio dipinto nella chiesa di Sant’Anna', caption: 'Le statue e il panneggio dipinto presso l’altare.' },
      { src: '/photos/sant-anna-illuminazione.webp', alt: 'Altare di Sant’Anna illuminato durante la festa', caption: 'L’altare illuminato durante la festa, 2012.' },
      { src: '/photos/cavalcata-ponte.webp', alt: 'Cavalcata in arrivo dal ponte lungo una stradina sterrata', caption: 'L’arrivo dal Ponte di Annibale verso Sant’Anna, lungo una stradina sterrata, 2014.' },
      { src: '/photos/cavalcata-trombonieri.webp', alt: 'Trombonieri di Cava presso la chiesa di Sant’Anna', caption: 'I trombonieri di Cava presso Sant’Anna, 2016.' },
      { src: '/photos/cavalcata-chiesa.webp', alt: 'Cavallerizza lancia confetti davanti alla chiesa di Sant’Anna', caption: 'Il lancio dei confetti durante la Cavalcata, 2018.' },
      { src: '/photos/cavalcata-altare.webp', alt: 'Cavallerizza in costume davanti all’altare di Sant’Anna', caption: 'L’arrivo della Cavalcata all’altare, 2024.' },
    ],
  },
];

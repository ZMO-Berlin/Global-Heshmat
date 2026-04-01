// ════════════════════════════════════════════════════════════════
// ARTWORK DATA
// ════════════════════════════════════════════════════════════════
// Each entry represents one artwork or site.
//
// HOW TO ADD IMAGES:
//   Option A — single image (simple):
//     1. Drop the photo into the images/ folder
//     2. Set the "image" field to the filename, e.g. "dawn-of-egypt.jpg"
//     3. Optionally set "imageCaption" for photo credits
//
//   Option B — multiple images (gallery with lightbox):
//     1. Drop all photos into images/
//     2. Add an "images" array with objects: { src: "filename.jpg", caption: "optional" }
//     3. The sidebar will show a gallery with thumbnails and prev/next arrows
//     4. Clicking the image opens a full-screen lightbox viewer
//     Note: when "images" is present, "image" and "imageCaption" are ignored.
//
// HOW TO ADD A NEW LOCATION:
//   Copy an existing entry, change the id (must be unique),
//   and fill in the fields. Coordinates: use Google Maps or
//   Plus Codes converted via https://plus.codes/
//
// FIELDS:
//   id            – unique number
//   name          – artwork / site name
//   lat, lng      – coordinates (approximate where from Plus Codes)
//   country       – used for filter chips
//   city          – displayed in sidebar
//   status        – "located" or "search" (to be found)
//   address       – street address or Plus Code
//   desc          – description text (HTML allowed)
//   image         – filename in images/ folder (empty string = placeholder)
//   imageCaption  – photo credit line (optional)
//   images        – array of {src, caption} for multi-image gallery (optional)
//   links         – array of {label, url} for external links (optional)
//   video         – YouTube URL, will be embedded in sidebar (optional)
//   movement      – for relocated works: {fromLat, fromLng, fromName, year}
// ════════════════════════════════════════════════════════════════

const artworks = [

  // ── EGYPT — CAIRO ──

  {
    id: 1,
    name: "The Agricultural Museum",
    lat: 30.038, lng: 31.213,
    country: "Egypt", city: "Cairo (Dokki)",
    status: "located",
    address: "26W6+98G, Ad Doqi, Dokki, Giza Governorate 12611",
    image: "", imageCaption: "",
    desc: "This proof of existence was taken by chance in 2025 during a visit of the museum by art historian Nadine Nour el Din."
  },

  {
    id: 2,
    name: "Museum of Modern Egyptian Art",
    lat: 30.061, lng: 31.224,
    country: "Egypt", city: "Cairo (Zamalek)",
    status: "located",
    address: "Zamalek, Cairo Governorate 4270020",
    image: "", imageCaption: "",
    desc: "[Aufnahmen + Text folgen Mai 2026, SH]"
  },

  {
    id: 3,
    name: "The Hassan Heshmat Museum",
    lat: 30.131, lng: 31.328,
    country: "Egypt", city: "Cairo (Ain Shams)",
    status: "located",
    address: "48J9+69R, Ein Shams Al Gharbeyah, El Matareya, Cairo Governorate 4533483",
    image: "", imageCaption: "",
    desc: "The Museum of the artist Hassan Heshmat in Ain Shams is one of the precious house museums in Egypt. Its former owner, the sculptor Hassan Heshmat (1920\u20132006) worked with numerous materials like clay, wood, metal, stone or porcelain in sizes between 10cm and 10m. His works can be found all over Egypt. He donated his private house, workshop, gallery and sculpture garden to the Ministry of Culture which opened the museum in 2018.",
    links: [
      { label: "Fine Art Museum page", url: "https://www.fineart.gov.eg/Eng/musem/Musem.asp?IDs=15" }
    ]
  },

  {
    id: 4,
    name: "Metro Station Ain Shams \u2014 Statue of Love",
    lat: 30.131, lng: 31.330,
    country: "Egypt", city: "Cairo (Ain Shams)",
    status: "located",
    address: "Ain Shams Sharkeya, Ain Shams, Cairo Governorate 4630001",
    image: "", imageCaption: "",
    desc: "The Metro Station hosts the \u2018Statue of Love\u2019."
  },

  {
    id: 5,
    name: "The Dawn of Egypt",
    lat: 30.297, lng: 31.765,
    country: "Egypt", city: "10th of Ramadan City",
    status: "located",
    address: "7QVJ+XGG, 10th of Ramadan City 1, Al-Sharqia Governorate 7065843",
    image: "", imageCaption: "",
    desc: "The sculpture The Dawn of Egypt, eight-metre high and made of white stone, was erected in 1982 at Midan Gala\u2019a. Every day, tens of thousands of people passed by the eight-metre-high statue. Popularly known as Gala\u2019a Masr, as it stood near the bridge of the same name in el-Nozha and referred to the Anglo-Egyptian Agreement of 1954 on the evacuation of British forces from the Suez Zone. In 2022, it had to make way for road construction in Cairo. By courtesy of Marie L. Bishara (see also BTM) it now stands completely renovated at this roundabout in 10th of Ramadan City.",
    movement: {
      fromLat: 30.0953, fromLng: 31.3428,
      fromName: "Midan Gala\u2019a, Cairo",
      year: 2022
    }
  },

  {
    id: 6,
    name: "BTM Factory entrance \u2014 Mother and Child",
    lat: 30.2965, lng: 31.7645,
    country: "Egypt", city: "10th of Ramadan City",
    status: "located",
    address: "Misr & El Sudan St, 10th of Ramadan City 1, Al-Sharqia Governorate 7065846",
    image: "", imageCaption: "Foto: E. Gothe 2025",
    desc: "In 1960, Louis Bishara founded a textile printing mill, which he turned into Egypt\u2019s first private-sector apparel factory in 1980, BTM (since 2024 Bishara Apparel Group). Louis Bishara became an admirer of Heshmat\u2019s work and assembled a private collection. In addition, he posited statues on his factory premise in 10th of Ramadan City. This work of art stands in the entrance to his factory: \u2018Mother and Child\u2019. His eldest daughter Marie is a designer as well as vice chairwoman of the Bishara Group. She continues the sponsorship of artworks by Hassan Heshmat."
  },

  {
    id: 7,
    name: "BTM Factory premises \u2014 Fashion Figure",
    lat: 30.293, lng: 31.760,
    country: "Egypt", city: "10th of Ramadan City",
    status: "located",
    address: "7QWH+HXH, 10th of Ramadan City 1",
    image: "", imageCaption: "",
    desc: "In 1993, Bishara commissioned Heshmat to design a figure for his fashion factory in 10th of Ramadan City on the occasion of the opening of a tailored suit factory. Here too, Heshmat worked with the motif of women and men from different perspectives merged in one figure, but focuses on the modern fashion aspect, thus creating a fairly atypical work out of basalt stone with a mosaic."
  },

  {
    id: 8,
    name: "Oriental Weavers \u2014 Obelisk & Lion",
    lat: 30.272, lng: 31.745,
    country: "Egypt", city: "10th of Ramadan City",
    status: "located",
    address: "7P5X+8XM, Ismailia Desert Rd, El Sharqeya, 10th of Ramadan City 1, Al-Sharqia Governorate 7067171",
    image: "", imageCaption: "",
    desc: "With the gradual privatisation of Gamal Abdel Nasser\u2019s socialist planned economy under his successor Anwar Sadat, Heshmat established close relationships with industrialists such as Mohamed Farid Khamis (1940\u20132020), founder of the carpet manufacturer Oriental Weavers, and Louis Bishara, founder of the fashion company BTM. The Oriental Weavers Group was founded in 1979 by industrialist and entrepreneur Khamis. The Group has emerged from a single loom operation to the largest producer of machine-woven carpets in the world. According to Heshmat\u2019s autobiography, a lion and an obelisk are standing at the headquarters in 10th of Ramadan City. The business tycoon, twenty years younger than Heshmat, became a cornerstone of Sadat\u2019s infitah-policies (economic opening towards capitalism). Khamis served as head of the Egyptian Investors Federation.<br><br>The artist writes: \u201CThe obelisk represents the body of Egypt, with its name written in hieroglyphics and its elements connected at the top. Approximately 4 metres of basalt stone in front of the Oriental Weavers Factory in 10th of Ramadan City in 1994.\u201D (1997: 118)"
  },

  {
    id: 9,
    name: "Open Air Museum and Gallery, Kafraoui Park",
    lat: 30.286, lng: 31.753,
    country: "Egypt", city: "10th of Ramadan City",
    status: "located",
    address: "7QF3+7QW, 10th of Ramadan City 1, Al-Sharqia Governorate 7063150",
    image: "", imageCaption: "",
    desc: "Louis Bishara donated a sculpture park for the industrial city with twelve of Heshmat\u2019s works and a small gallery in the public Kafraoui Park, named after Hassaballah Al-Kafraoui (1930\u20132021), housing minister from 1977 to 1993. Under his auspices fell the first generation of new cities around Cairo, like 15th of May City or 10th of Ramadan City itself."
  },

  {
    id: 10,
    name: "El Gezirah Sheraton \u2014 Statue of Love",
    lat: 30.049, lng: 31.224,
    country: "Egypt", city: "Cairo (Zamalek)",
    status: "located",
    address: "Sofitel Cairo Nile El Gezirah",
    image: "", imageCaption: "",
    desc: "Heshmat equipped various branches of the Sheraton in Cairo with towering statues. At the Gezirah Sheraton it was the statue of \u2018Love\u2019. This figurine was also commissioned as a gift edition in 13cm for visitors of the hotel."
  },

  {
    id: 11,
    name: "Heliopolis Sheraton \u2014 Welcome",
    lat: 30.091, lng: 31.338,
    country: "Egypt", city: "Cairo (Heliopolis)",
    status: "located",
    address: "Hilton Cairo Heliopolis",
    image: "", imageCaption: "",
    desc: "In 1980, the three-metre high statue \u2018Welcome\u2019 made from granite stone was placed at the entrance of the Heliopolis Sheraton. The Sheraton chain in Egypt had close relations with the artist, as Eugen Auer, General Manager of the Heliopolis Sheraton from 1983\u201385 relays. He and his wife met the couple Hassan Heshmat and Madiha el-Gaky on various occasions. Ten years later a fire spread in the hotel, killing 16 people and leaving the 630-bed hotel in ruins. The hotel was closed and only reopened seven years later. Though the statue is shown in the artist\u2019s autobiography after it had been cleaned of traces of the fire, it is not known, where the sculpture stands today."
  },

  {
    id: 12,
    name: "Daughter of the Nile",
    lat: 29.988, lng: 31.135,
    country: "Egypt", city: "Cairo (Pyramids)",
    status: "located",
    address: "Steigenberger Pyramids Cairo (formerly Jollyville M\u00f6venpick)",
    image: "", imageCaption: "",
    desc: "Made of stone, approximately three metres tall. In February 1986, the Jollyville M\u00f6venpick Hotel was set on fire during a major uprising by Egyptian security forces after rumours of a pay cut and extended service period. Further copies are today in the Hassan Heshmat Museum as well as in the public Kafraoui park."
  },

  {
    id: 13,
    name: "Armed Forces Officers\u2019 Club \u2014 Facade Relief",
    lat: 30.059, lng: 31.225,
    country: "Egypt", city: "Cairo (Zamalek)",
    status: "located",
    address: "Mohammed Mazhar, Zamalek, Giza Governorate 4271030 (26 July Street)",
    image: "", imageCaption: "",
    desc: "The Armed Forces Officers\u2019 Club in Zamalek (26 July Street) was established in the mid-1950s following the 1952 Egyptian Revolution as part of the expansion of military social institutions in Cairo. It offers member of the military recreation on Cairo\u2019s most popular island. The facade relief has been renovated recently. Not fitting in style, right above it, is a second frieze, by Fathy Mahmoud (1918\u20131982), one of his main competitors at the time."
  },

  {
    id: 14,
    name: "Agiba Petroleum Company \u2014 Calligraphy",
    lat: 30.057, lng: 31.350,
    country: "Egypt", city: "Cairo (Nasr City)",
    status: "located",
    address: "Agiba Petroleum Company, factory premises, Nasr City",
    image: "", imageCaption: "",
    desc: "4.5 metres made of stone and yellow and red brass. This calligraphy from 1995 with the name of the petroleum company Agiba was the last work of the artist according to his autobiography published in 1997."
  },

  {
    id: 15,
    name: "Le M\u00e9ridien Heliopolis \u2014 Horus Figure",
    lat: 30.093, lng: 31.342,
    country: "Egypt", city: "Cairo (Heliopolis)",
    status: "located",
    address: "51 El-Orouba, Almazah, Heliopolis, Cairo Governorate 4461030",
    image: "", imageCaption: "",
    desc: "Le M\u00e9ridien Heliopolis hosted a Horus figure, but the hotel is closed permanently today. Ca. 2 metres high, made from basalt stone. Foto from his autobiography 1997."
  },

  {
    id: 16,
    name: "Panorama October \u2014 Crossing the Impossible",
    lat: 30.058, lng: 31.340,
    country: "Egypt", city: "Cairo (Nasr City)",
    status: "located",
    address: "Al Estad, Qesm Than Madinet Nasr, Gouvernement Al-Qahira 4436011",
    image: "", imageCaption: "",
    desc: "Made out of metal with a size of ca. two metres, the statue \u2018Crossing the impossible \u2013 the Bar Lev Line and the Suez Canal\u2019 was erected in front of the Panorama October in 1979. It symbolizes the surprise victory of the Egyptian forces against the Israeli army at the beginning of the 1973 war, when crossing the strategically important Suez Canal. Today the statue is missing; only a small maquette exists."
  },

  {
    id: 17,
    name: "St. Therese Armenian Catholic Church",
    lat: 30.089, lng: 31.327,
    country: "Egypt", city: "Cairo (Heliopolis)",
    status: "located",
    address: "38RM+XR Heliopolis",
    image: "", imageCaption: "",
    desc: "The monument honours the inventor of the Armenian alphabet. The work is dedicated to Mesrop Mashtots and Isaac Partev, the creators of the Armenian alphabet, both of whom are considered saints in the Armenian Apostolic and Roman Catholic Churches. In the centre, the artist has engraved the following phrase from the Old Testament: \u2018They serve wisdom and education and help to understand astute speech.\u2019"
  },

  // ── BELGIUM ──

  {
    id: 18,
    name: "Heilig Kruiskerk \u2014 Missionaries Memorial",
    lat: 50.930, lng: 5.338,
    country: "Belgium", city: "Hasselt",
    status: "located",
    address: "Kruisherenlaan 29, 3500 Hasselt, W8CG+9F",
    image: "", imageCaption: "",
    // GALLERY EXAMPLE: add actual filenames to images/ folder, then uncomment:
    // images: [
    //   { src: "hasselt-memorial-overview.jpg", caption: "Memorial overview" },
    //   { src: "hasselt-bas-relief.jpg", caption: "Bas-relief detail" },
    //   { src: "hasselt-ceramic-panels.jpg", caption: "Ceramic panels (historical)" }
    // ],
    desc: "In memory of 23 Belgian missionaries murdered in Buta (Congo) in 1965, Hassan Heshmat was commissioned in 1970 by the Order of the Holy Cross to erect a memorial in Hasselt, Belgium. It is still unknown whether he won a competition or how the artist from Cairo was chosen to execute the project? He produced the ceramics in his workshop in Cairo and flew them in to Belgium. The memorial still stands today, however, the ceramic panels depicting the missionaries\u2019 robes, are no longer there. But the priest\u2019s heads, carved in bas-relief, are still in place.<br><br>KADOC, the interfaculty Documentation and Research Centre on Religion, Culture and Society at the KU Leuven, founded in 1976, has incorporated research results from Hegasy\u2019s projects into their archive and database."
  },

  // ── NETHERLANDS ──

  {
    id: 19,
    name: "Mosaics \u2014 Private Swimming Pool",
    lat: 51.062, lng: 5.862,
    country: "Netherlands", city: "Susteren",
    status: "located",
    address: "Marktstraat 45, 6114 HR Susteren",
    image: "", imageCaption: "",
    images: [
      { src: "Story map II.jpg", caption: "Wall reliefs at the private swimming pool" },
      { src: "Story map III.jpg", caption: "Tanzende" }
    ],
    desc: "Till 2025 it was unclear were these, very untypical reliefs decorating a private swimming pool were located. After the exhibition \u2018Hassan Heshmat: Artist of the people between cultural heritage and renewal\u2019 in 2025 by Divan \u2013 Das arabische Kulturhaus in Berlin and ZMO, the granddaughter of the owner got in touch with Sonja Hegasy. Her grandfather, the medical doctor Abe Koldijk and his wife Theresa Meigen had lived in Egypt at the end of the 1950s and became very close friends with Hassan Heshmat. Koldijk even organized an exhibition in Susteren in 1968. But the family had sold the house ten years ago, so it is currently unknown whether the mosaics are still in place."
  },

  // ── SWEDEN ──

  {
    id: 20,
    name: "2 B\u00e4uerinnen (Two Peasant Women)",
    lat: 55.605, lng: 13.000,
    country: "Sweden", city: "Malm\u00f6",
    status: "located",
    address: "Malm\u00f6",
    image: "", imageCaption: "",
    desc: "Two peasant women sculpture in Malm\u00f6.",
    links: [
      { label: "Wikimedia Commons", url: "https://commons.wikimedia.org/wiki/File:Tv%C3%A5_kvinnor_av_Hassan_Heshmat,_Malm%C3%B6.jpg" },
      { label: "Facebook photos (2025)", url: "https://www.facebook.com/media/set/?vanity=100069250535948&set=a.173848722695844" }
    ]
  },

  // ── GERMANY ──

  {
    id: 21,
    name: "Porzellanikon \u2014 Rosenthal Figurines",
    lat: 50.170, lng: 12.130,
    country: "Germany", city: "Selb",
    status: "located",
    address: "54Q8+PQ Selb",
    image: "", imageCaption: "",
    desc: "Rosenthal bought three designs from Hassan Heshmat. Only two have so far been found at the Porzellanikon in Selb: Woman with bowl (Model number 5123) and Standing Woman (Model number 5124). Both: Collection RAS, Permanent Loan, Oberfrankenstiftung Bayreuth. The artist himself calls these two figures in his autobiography: female farmer with basket and delicate farmer. He writes, that he exhibited the two figures (in their original form, i.e. not reworked by Rosenthal) 1968 in Rome and Geneva."
  },

  {
    id: 22,
    name: "Mosaic \u2014 Private House, Dr. Karl Kraus",
    lat: 48.962, lng: 10.132,
    country: "Germany", city: "Ellwangen",
    status: "located",
    address: "Ellwangen",
    image: "", imageCaption: "",
    desc: "According to his CV, Dr Karl Kraus worked in the pharmaceutical industry and had been a member of the Rotary Club (like Hassan Heshmat) since May 1969, initially in Egypt (Giza and Heliopolis), later in Brazil and Italy. In 1992/93, he became vice-president of the Rotary Club in Ellwangen. On the wall of his house is a work of art by Hassan Heshmat dated 1969. After Dr. Kraus\u2019 death, the owners of the house changed in 2025, but were surprised to be able to identify the artist thanks to the Berlin exhibition by Divan and ZMO in the same year."
  },

  // ── POLAND ──

  {
    id: 23,
    name: "Muzeum Narodowe \u2014 12 Enamelled Clay Works",
    lat: 52.232, lng: 21.025,
    country: "Poland", city: "Warsaw",
    status: "located",
    address: "62JF+RM Warschau",
    image: "", imageCaption: "",
    desc: "Research by curator Katharina M. Raab found that the Muzeum Narodowe w Warszawie houses a total of 12 enamelled clay works by Hassan Heshmat: one tile, two bowls and nine figurative works. The works have been part of the collection since 1957 and were created before Heshmat\u2019s decisive period in Selb.<br><br>We like to thank curator Kaja Muszynska for her careful examination. (Email exchange between Katharina M. Raab and Kaja Muszynska on 4 June 2025)"
  },

  // ── TO BE FOUND ──

  {
    id: 24,
    name: "Meerjungfrauenstatue (Mermaid Statue)",
    lat: 27.258, lng: 33.812,
    country: "Egypt", city: "Hurghada",
    status: "search",
    address: "Hurghada (approximate)",
    image: "", imageCaption: "",
    desc: "Meerjungfrauenstatue, Hurghada Wahrzeichen. Possibly depicted in the artist\u2019s autobiography.",
    links: [
      { label: "Autobiography PDF (ZMO)", url: "https://repositorium.zmo.de/receive/zmo_mods_00000557" }
    ]
  },

  {
    id: 25,
    name: "Die Gabe der Mutterschaft (Gift of Motherhood)",
    lat: 31.200, lng: 29.919,
    country: "Egypt", city: "Alexandria",
    status: "search",
    address: "Children\u2019s village, Alexandria",
    image: "", imageCaption: "",
    desc: "Die Gabe der Mutterschaft; Stein; two meters high. One copy is located in a children\u2019s village in Alexandria."
  },

  {
    id: 26,
    name: "Symbol of the Matrouh Governorate",
    lat: 31.353, lng: 27.245,
    country: "Egypt", city: "Marsa Matrouh",
    status: "search",
    address: "Entrance to the sports stadium (according to autobiography)",
    image: "", imageCaption: "",
    desc: "Symbol of the Matrouh Governorate. One copy is in Kafraoui park, 10th of Ramadan City, another according to his autobiography at the entrance to the sports stadium."
  },

  {
    id: 27,
    name: "Egypt Air \u2014 Triple Menkaure Statue",
    lat: 48.870, lng: 2.340,
    country: "France", city: "Paris",
    status: "search",
    address: "Egypt Air-Eingang in Paris",
    image: "", imageCaption: "",
    desc: "Egypt Air-Eingang in Paris mit einer dreifachen Menkaure-Statue."
  },

  {
    id: 28,
    name: "Ceramic Plaque",
    lat: 39.759, lng: -84.192,
    country: "USA", city: "Dayton, Ohio",
    status: "search",
    address: "Dayton, Ohio",
    image: "", imageCaption: "",
    desc: "A ceramic plaque (approximately 3.5 square metres) in Dayton, Ohio."
  },

  {
    id: 29,
    name: "Die sesshafte Familie (The Settled Family)",
    lat: 42.360, lng: -71.059,
    country: "USA", city: "Boston",
    status: "search",
    address: "Church in Boston, USA",
    image: "", imageCaption: "",
    desc: "Die sesshafte Familie \u2013 etwa zwei Meter gro\u00dfer Basaltstein von einem Exemplar in einer Kirche in Boston, USA. Foto aus meinem Museum in Ain Shams aus dem Jahr 1974."
  },

  {
    id: 30,
    name: "Statue der B\u00e4uerin al-Mishna (?)",
    lat: 56.50, lng: 16.66,
    country: "Sweden", city: "Palmar (?)",
    status: "search",
    address: "Palmar (?), Sweden",
    image: "", imageCaption: "",
    desc: "Statue der B\u00e4uerin al-Mishna (?) (Bronze) (Brunnen in der Stadt Palmar, Schweden, 1985). The town name could not be confirmed."
  }
];

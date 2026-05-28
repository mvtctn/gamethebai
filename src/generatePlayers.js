import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const goldenBallers = [
  "Lionel Messi", "Kylian Mbappe", "Erling Haaland", "Jude Bellingham", "Vinicius Junior", 
  "Kevin De Bruyne", "Harry Kane", "Mohamed Salah", "Bukayo Saka", "Antoine Griezmann", 
  "Rodri", "Phil Foden", "Declan Rice", "Bernardo Silva", "Robert Lewandowski",
  "Lamine Yamal", "Cole Palmer", "Florian Wirtz", "Jamal Musiala", "Lautaro Martinez",
  "Fede Valverde", "Viktor Gyokeres"
];

const topKeepers = [
  "Emiliano Martinez", "Alisson Becker", "Thibaut Courtois", "Mike Maignan", "Ederson", 
  "Jan Oblak", "Marc-Andre ter Stegen", "Yann Sommer", "Gregor Kobel", "Jordan Pickford", 
  "David Raya", "Diogo Costa", "Wojciech Szczesny", "Yassine Bounou", "Edouard Mendy",
  "Gianluigi Donnarumma", "Manuel Neuer", "David de Gea", "Unai Simon", "Guglielmo Vicario",
  "Andriy Lunin", "Nick Pope"
];

const defensiveRocks = [
  "Virgil van Dijk", "Ruben Dias", "William Saliba", "Antonio Rudiger", "Marquinhos", 
  "Ronald Araujo", "Eder Militao", "John Stones", "Gabriel Magalhaes", "Bremer", 
  "Josko Gvardiol", "Alessandro Bastoni", "Jules Kounde", "Mats Hummels", "Theo Hernandez", 
  "Achraf Hakimi", "Kyle Walker", "Cristian Romero", "Alphonso Davies", "Lisandro Martinez",
  "Manuel Akanji", "Jonathan Tah", "Pau Cubarsi", "Federico Dimarco", "Nico Schlotterbeck",
  "Ibrahima Konate", "Micky van de Ven", "Alex Grimaldo", "Piero Hincapie", "Dayot Upamecano"
];

const midfieldMaestros = [
  "Pedri", "Jamal Musiala", "Florian Wirtz", "Fede Valverde", "Bruno Fernandes", 
  "Martin Odegaard", "Aurelien Tchouameni", "Eduardo Camavinga", "Joshua Kimmich", 
  "Frenkie de Jong", "Ilkay Gundogan", "Alexis Mac Allister", "Gavi", "Dominik Szoboszlai", 
  "Enzo Fernandez", "Douglas Luiz", "Bruno Guimaraes", "Hakan Calhanoglu", "Nicolo Barella", 
  "Mateo Kovacic", "Toni Kroos", "Luka Modric", "James Maddison", "Adrien Rabiot", 
  "Manuel Locatelli", "Rodrigo De Paul", "Kobbie Mainoo", "Warren Zaire-Emery", "Vitinha",
  "Joao Neves", "Marc Casado", "Martin Zubimendi", "Ryan Gravenberch", "Moises Caicedo",
  "Sandro Tonali", "Conor Gallagher", "Davide Frattesi", "Arda Guler", "Wataru Endo",
  "Leon Goretzka", "Robert Andrich", "Fabian Ruiz"
];

const goalMachines = [
  "Lautaro Martinez", "Victor Osimhen", "Son Heung-min", "Rafael Leao", 
  "Khvicha Kvaratskhelia", "Marcus Rashford", "Ousmane Dembele", "Rodrygo", "Julian Alvarez", 
  "Leroy Sane", "Kingsley Coman", "Cody Gakpo", "Dusan Vlahovic", "Alexander Isak", 
  "Ollie Watkins", "Darwin Nunez", "Luis Diaz", "Victor Boniface", "Serhou Guirassy", 
  "Santiago Gimenez", "Jonathan David", "Mitoma Kaoru", "Kubo Takefusa", "Hwang Hee-chan", 
  "Alvaro Morata", "Niclas Fullkrug", "Randal Kolo Muani", "Loïs Openda", "Donyell Malen",
  "Raphinha", "Nicolas Jackson", "Dominic Solanke", "Alexander Sorloth", "Ademola Lookman",
  "Marcus Thuram", "Benjamin Sesko", "Michael Olise", "Kenan Yildiz", "Savinho",
  "Pierre-Emerick Aubameyang", "Christopher Nkunku", "Diogo Jota"
];

const icons = [
  "Neymar", "Sadio Mane", "Riyad Mahrez", "N'Golo Kante", "Cristiano Ronaldo",
  "Raheem Sterling", "Jack Grealish", "Trent Alexander-Arnold", "Andy Robertson", 
  "Hakim Ziyech", "Roberto Firmino", "James Rodriguez", "Christian Pulisic", 
  "Weston McKennie", "Gio Reyna", "Guillermo Ochoa", "Keylor Navas", "Christian Eriksen", 
  "Kasper Schmeichel", "Granit Xhaka", "Xherdan Shaqiri", "Ivan Perisic", "Marcelo Brozovic", 
  "Paul Pogba", "Jadon Sancho", "Mason Mount", "Reece James", "Ben Chilwell", 
  "John McGinn", "Scott McTominay", "Kieran Tierney", "Brennan Johnson", "Olivier Giroud", 
  "Thomas Muller", "Angel Di Maria", "Alexis Sanchez", "Arturo Vidal", "Edinson Cavani", 
  "Radamel Falcao", "Juan Cuadrado", "Marco Verratti", "Ciro Immobile", "Karim Benzema",
  "Zinedine Zidane", "Ronaldinho", "Ronaldo Nazario", "Pele", "Diego Maradona",
  "Johan Cruyff", "Thierry Henry", "David Beckham", "Andrea Pirlo", "Kaka",
  "Steven Gerrard", "Frank Lampard", "Wayne Rooney", "Paolo Maldini", "Fabio Cannavaro",
  "Roberto Carlos", "Cafu", "Gianluigi Buffon", "Iker Casillas", "Zlatan Ibrahimovic",
  "Alessandro Del Piero", "Oliver Kahn", "Michael Ballack", "Miroslav Klose",
  "Xavi Hernandez", "Andres Iniesta", "David Villa", "Philipp Lahm", "Bastian Schweinsteiger"
];

const fanFavs = [
  "Richarlison", "Lucas Paqueta", "Antony", "Gabriel Martinelli", "Gabriel Jesus", 
  "Alejandro Garnacho", "Emiliano Buendia", "Leandro Paredes", "Angel Correa", 
  "Paulo Dybala", "Joao Felix", "Goncalo Ramos", "Joao Cancelo", "Ruben Neves", 
  "Nuno Mendes", "Pau Torres", "Dani Olmo", "Mikel Oyarzabal", "Ferran Torres", 
  "Ansu Fati", "Alejandro Balde", "Nico Williams", "Lamine Yamal", "Kai Havertz", 
  "Julian Brandt", "David Raum", "Jeremie Frimpong", "Xavi Simons", "Matthijs de Ligt", 
  "Nathan Ake", "Denzel Dumfries", "Teun Koopmeiners", "Memphis Depay", "Romelu Lukaku", 
  "Jeremy Doku", "Leandro Trossard", "Youri Tielemans", "Amadou Onana", "Timothy Castagne", 
  "Arthur Theate", "Rasmus Hojlund", "Harvey Elliott", "Curtis Jones", "Anthony Gordon", 
  "Cole Palmer", "Conor Gallagher", "Levi Colwill", "Malo Gusto", "Ben White",
  "Endrick", "Brahim Diaz", "Noni Madueke", "Jhon Duran", "Amad Diallo",
  "Oscar Bobb", "Bradley Barcola", "Kobbie Mainoo", "Warren Zaire-Emery", "Vitinha"
];

const commonPlayers = [
  "Miles Robinson", "Walker Zimmerman", "Jesus Ferreira", "Cristian Roldan", "Aaron Long", 
  "Sean Johnson", "DeAndre Yedlin", "Kellyn Acosta", "Jordan Morris", "Milan Borjan", 
  "Samuel Piette", "Junior Hoilett", "Lucas Cavallini", "Alistair Johnston", "Kamal Miller", 
  "Richie Laryea", "Jesus Gallardo", "Cesar Montes", "Luis Romo", "Uriel Antuna", 
  "Roberto Alvarado", "Henry Martin", "Luis Chavez", "Shuichi Gonda", "Miki Yamane", 
  "Shogo Taniguchi", "Gaku Shibasaki", "Yuki Soma", "Ayase Ueda", "Hiroki Sakai", 
  "Kim Seung-gyu", "Kim Jin-su", "Kim Moon-hwan", "Jung Woo-young", "Kwon Chang-hoon", 
  "Na Sang-ho", "Cho Gue-sung", "Hwang Ui-jo", "Mathew Ryan", "Kye Rowles", 
  "Aziz Behich", "Jackson Irvine", "Aaron Mooy", "Craig Goodwin", "Mitchell Duke", 
  "Riley McGree", "Mohammed Al-Owais", "Ali Al-Bulaihi", "Saud Abdulhamid", "Mohamed Kanno", 
  "Salem Al-Dawsari", "Firas Al-Buraikan", "Saleh Al-Shehri", "Tajon Buchanan", "Stephen Eustaquio",
  "Ismael Kone", "Cyle Larin", "Liam Millar", "Doneil Henry", "Jonathan Osorio",
  "Sam Adekugbe", "Dayne St. Clair", "Joel Waterman", "Jacen Russell-Rowe", "Mathieu Choiniere",
  // Integrated weakPlayers from addCommonPlayers.js
  "Nguyen Quang Hai", "Nguyen Tien Linh", "Que Ngoc Hai", "Dang Van Lam", "Doan Van Hau", "Bui Tien Dung", "Do Hung Dung",
  "Chanathip Songkrasin", "Theerathon Bunmathan", "Teerasil Dangda", "Supachok Sarachat", "Suphanat Mueanta",
  "Pratama Arhan", "Asnawi Mangkualam", "Witan Sulaeman", "Egy Maulana Vikri", "Marselino Ferdinan",
  "Safawi Rasid", "Arif Aiman", "Faisal Halim", "Dion Cools",
  "Wu Lei", "Zhang Yuning", "Wei Shihao", "Yan Junling",
  "Ali Mabkhout", "Omar Abdulrahman", "Akram Afif", "Almoez Ali", "Hassan Al-Haydos", "Boualem Khoukhi",
  "Eldor Shomurodov", "Jaloliddin Masharipov", "Otabek Shukurov",
  "Ali Maaloul", "Ferjani Sassi", "Youssef Msakni", "Taha Yassine Khenissi",
  "Celso Borges", "Yeltsin Tejeda", "Oscar Duarte", "Joel Campbell"
];

const generatePlayers = () => {
  const players = [];
  let idCounter = 1;

  const getSeed = (name) => name.replace(/\s+/g, '').toLowerCase();

  const addPlayer = (name, nation, type, attack, defense, control, isIcon = false, hasBase = true) => {
    players.push({
      id: `p${idCounter++}`,
      name,
      nation,
      type,
      stats: { attack, defense, control },
      image: `https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png`
    });

    if (hasBase && !isIcon) {
      players.push({
        id: `p${idCounter++}`,
        name,
        nation,
        type: 'Base',
        stats: {
          attack: Math.max(10, attack - 15),
          defense: Math.max(10, defense - 15),
          control: Math.max(10, control - 15)
        },
        image: `https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png`
      });
    }
  };

  // Add all players
  goldenBallers.forEach((name) => addPlayer(name, 'World', 'Golden Baller', 95 + Math.floor(Math.random()*4), 50 + Math.floor(Math.random()*20), 90 + Math.floor(Math.random()*8), false, true));
  icons.forEach((name) => addPlayer(name, 'World', 'Icon', 90 + Math.floor(Math.random()*8), 60 + Math.floor(Math.random()*30), 85 + Math.floor(Math.random()*12), true, false));
  fanFavs.forEach((name) => addPlayer(name, 'World', 'Fan Favourite', 85 + Math.floor(Math.random()*8), 50 + Math.floor(Math.random()*30), 82 + Math.floor(Math.random()*12), true, false));
  topKeepers.forEach((name) => addPlayer(name, 'World', 'Top Keeper', 20 + Math.floor(Math.random()*15), 90 + Math.floor(Math.random()*8), 75 + Math.floor(Math.random()*10), false, true));
  defensiveRocks.forEach((name) => addPlayer(name, 'World', 'Defensive Rock', 45 + Math.floor(Math.random()*20), 90 + Math.floor(Math.random()*8), 75 + Math.floor(Math.random()*10), false, true));
  midfieldMaestros.forEach((name) => addPlayer(name, 'World', 'Midfield Maestro', 80 + Math.floor(Math.random()*10), 75 + Math.floor(Math.random()*10), 92 + Math.floor(Math.random()*6), false, true));
  goalMachines.forEach((name) => addPlayer(name, 'World', 'Goal Machine', 92 + Math.floor(Math.random()*6), 40 + Math.floor(Math.random()*15), 85 + Math.floor(Math.random()*8), false, true));

  // Common Players (Weak stats)
  commonPlayers.forEach(name => {
    players.push({
      id: `p${idCounter++}`,
      name: name,
      nation: 'World',
      type: 'Base',
      stats: {
        attack: 40 + Math.floor(Math.random() * 25),
        defense: 40 + Math.floor(Math.random() * 25),
        control: 40 + Math.floor(Math.random() * 25)
      },
      image: `https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png`
    });
  });

  return players;
};

// Preserve existing image URLs if they exist in current players.json to avoid refetching
const playersPath = path.join(__dirname, 'players.json');
let existingImages = {};
try {
  const oldData = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
  oldData.forEach(p => {
    if (p.image && !p.image.includes('dicebear') && !p.image.includes('Portrait_Placeholder')) {
      existingImages[p.name] = p.image;
    }
  });
} catch(e) {}

const newPlayersData = generatePlayers();
newPlayersData.forEach(p => {
  if (existingImages[p.name]) {
    p.image = existingImages[p.name];
  }
});

fs.writeFileSync(playersPath, JSON.stringify(newPlayersData, null, 2));
console.log(`Generated ${newPlayersData.length} cards.`);

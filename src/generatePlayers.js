import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const goldenBallers = ["Lionel Messi", "Kylian Mbappe", "Erling Haaland", "Jude Bellingham", "Vinicius Junior", "Kevin De Bruyne", "Harry Kane", "Mohamed Salah", "Bukayo Saka"];
const topKeepers = ["Emiliano Martinez", "Alisson Becker", "Thibaut Courtois", "Mike Maignan", "Ederson", "Jan Oblak", "Marc-Andre ter Stegen"];
const defensiveRocks = ["Virgil van Dijk", "Ruben Dias", "William Saliba", "Antonio Rudiger", "Marquinhos", "Ronald Araujo", "Eder Militao", "John Stones"];
const midfieldMaestros = ["Rodri", "Pedri", "Jamal Musiala", "Florian Wirtz", "Fede Valverde", "Declan Rice", "Bruno Fernandes", "Martin Odegaard", "Bernardo Silva", "Aurelien Tchouameni", "Eduardo Camavinga", "Joshua Kimmich", "Frenkie de Jong", "Ilkay Gundogan", "Alexis Mac Allister", "Gavi", "Dominik Szoboszlai"];

// Đã xoá Cristiano Ronaldo (sẽ 41 tuổi) để đảm bảo tính thuần tuý 2026
const goalMachines = ["Robert Lewandowski", "Lautaro Martinez", "Victor Osimhen", "Son Heung-min", "Antoine Griezmann", "Rafael Leao", "Khvicha Kvaratskhelia", "Marcus Rashford", "Ousmane Dembele", "Rodrygo", "Julian Alvarez", "Phil Foden", "Leroy Sane", "Kingsley Coman", "Cody Gakpo", "Dusan Vlahovic", "Alexander Isak", "Ollie Watkins", "Darwin Nunez"];

// Đã xoá các cầu thủ giải nghệ/sắp nghỉ: Luis Suarez, Javier Hernandez, Simon Kjaer, Raphael Varane, Hugo Lloris
const icons = [
  "Luka Modric", "Neymar", "Sadio Mane", "Riyad Mahrez", "N'Golo Kante", 
  "Raheem Sterling", "Jack Grealish", "Trent Alexander-Arnold", "Andy Robertson", "Alphonso Davies", 
  "Achraf Hakimi", "Hakim Ziyech", "Roberto Firmino", "James Rodriguez", 
  "Christian Pulisic", "Weston McKennie", "Gio Reyna", "Guillermo Ochoa", 
  "Keylor Navas", "Christian Eriksen", "Kasper Schmeichel", "Granit Xhaka", 
  "Xherdan Shaqiri", "Ivan Perisic", "Marcelo Brozovic", "Lisandro Martinez", 
  "Paul Pogba", "Jadon Sancho", "Mason Mount", "Reece James", 
  "Ben Chilwell", "John McGinn", "Scott McTominay", "Kieran Tierney", "Brennan Johnson"
];

// Đã xoá Pepe
const fanFavs = [
  "Richarlison", "Lucas Paqueta", "Antony", "Gabriel Martinelli", "Gabriel Jesus", 
  "Alejandro Garnacho", "Cristian Romero", "Emiliano Buendia", "Rodrigo De Paul", 
  "Leandro Paredes", "Angel Correa", "Paulo Dybala", "Joao Felix", "Goncalo Ramos", 
  "Joao Cancelo", "Ruben Neves", "Vitinha", "Nuno Mendes", 
  "Pau Torres", "Dani Olmo", "Mikel Oyarzabal", "Ferran Torres", "Ansu Fati", 
  "Alejandro Balde", "Nico Williams", "Lamine Yamal", "Kai Havertz", "Niclas Fullkrug", 
  "Julian Brandt", "Nico Schlotterbeck", "David Raum", "Jeremie Frimpong", "Xavi Simons", 
  "Matthijs de Ligt", "Nathan Ake", "Denzel Dumfries", "Teun Koopmeiners", "Memphis Depay", 
  "Romelu Lukaku", "Jeremy Doku", "Leandro Trossard", "Youri Tielemans", "Amadou Onana", 
  "Lois Openda", "Timothy Castagne", "Arthur Theate"
];

const commonPlayers = [
  "Miles Robinson", "Walker Zimmerman", "Jesus Ferreira", "Cristian Roldan", "Aaron Long", "Sean Johnson", "DeAndre Yedlin", "Kellyn Acosta", "Jordan Morris",
  "Milan Borjan", "Samuel Piette", "Junior Hoilett", "Lucas Cavallini", "Alistair Johnston", "Kamal Miller", "Richie Laryea",
  "Jesus Gallardo", "Cesar Montes", "Luis Romo", "Uriel Antuna", "Roberto Alvarado", "Henry Martin", "Luis Chavez",
  "Shuichi Gonda", "Miki Yamane", "Shogo Taniguchi", "Gaku Shibasaki", "Yuki Soma", "Ayase Ueda", "Hiroki Sakai",
  "Kim Seung-gyu", "Kim Jin-su", "Kim Moon-hwan", "Jung Woo-young", "Kwon Chang-hoon", "Na Sang-ho", "Cho Gue-sung", "Hwang Ui-jo",
  "Mathew Ryan", "Kye Rowles", "Aziz Behich", "Jackson Irvine", "Aaron Mooy", "Craig Goodwin", "Mitchell Duke", "Riley McGree",
  "Mohammed Al-Owais", "Ali Al-Bulaihi", "Saud Abdulhamid", "Mohamed Kanno", "Salem Al-Dawsari", "Firas Al-Buraikan", "Saleh Al-Shehri"
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

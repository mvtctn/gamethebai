import fs from 'fs';

const playersPath = './src/players.json';

// ISO Alpha-2 codes cho flagcdn
const nationMap = {
  "Lionel Messi": "ar",
  "Kylian Mbappe": "fr",
  "Erling Haaland": "no",
  "Jude Bellingham": "gb-eng",
  "Vinicius Junior": "br",
  "Kevin De Bruyne": "be",
  "Harry Kane": "gb-eng",
  "Mohamed Salah": "eg",
  "Bukayo Saka": "gb-eng",
  "Emiliano Martinez": "ar",
  "Alisson Becker": "br",
  "Thibaut Courtois": "be",
  "Mike Maignan": "fr",
  "Ederson": "br",
  "Jan Oblak": "si",
  "Marc-Andre ter Stegen": "de",
  "Virgil van Dijk": "nl",
  "Ruben Dias": "pt",
  "William Saliba": "fr",
  "Antonio Rudiger": "de",
  "Marquinhos": "br",
  "Ronald Araujo": "uy",
  "Eder Militao": "br",
  "John Stones": "gb-eng",
  "Rodri": "es",
  "Pedri": "es",
  "Jamal Musiala": "de",
  "Florian Wirtz": "de",
  "Fede Valverde": "uy",
  "Declan Rice": "gb-eng",
  "Bruno Fernandes": "pt",
  "Martin Odegaard": "no",
  "Bernardo Silva": "pt",
  "Aurelien Tchouameni": "fr",
  "Eduardo Camavinga": "fr",
  "Joshua Kimmich": "de",
  "Frenkie de Jong": "nl",
  "Ilkay Gundogan": "de",
  "Alexis Mac Allister": "ar",
  "Gavi": "es",
  "Dominik Szoboszlai": "hu",
  "Robert Lewandowski": "pl",
  "Lautaro Martinez": "ar",
  "Victor Osimhen": "ng",
  "Son Heung-min": "kr",
  "Antoine Griezmann": "fr",
  "Rafael Leao": "pt",
  "Khvicha Kvaratskhelia": "ge",
  "Marcus Rashford": "gb-eng",
  "Ousmane Dembele": "fr",
  "Rodrygo": "br",
  "Julian Alvarez": "ar",
  "Phil Foden": "gb-eng",
  "Leroy Sane": "de",
  "Kingsley Coman": "fr",
  "Cody Gakpo": "nl",
  "Dusan Vlahovic": "rs",
  "Alexander Isak": "se",
  "Ollie Watkins": "gb-eng",
  "Darwin Nunez": "uy",
  "Luka Modric": "hr",
  "Neymar": "br",
  "Sadio Mane": "sn",
  "Riyad Mahrez": "dz",
  "N'Golo Kante": "fr",
  "Raheem Sterling": "gb-eng",
  "Jack Grealish": "gb-eng",
  "Trent Alexander-Arnold": "gb-eng",
  "Andy Robertson": "gb-sct",
  "Alphonso Davies": "ca",
  "Achraf Hakimi": "ma",
  "Hakim Ziyech": "ma",
  "Roberto Firmino": "br",
  "James Rodriguez": "co",
  "Christian Pulisic": "us",
  "Weston McKennie": "us",
  "Gio Reyna": "us",
  "Guillermo Ochoa": "mx",
  "Keylor Navas": "cr",
  "Christian Eriksen": "dk",
  "Kasper Schmeichel": "dk",
  "Granit Xhaka": "ch",
  "Xherdan Shaqiri": "ch",
  "Ivan Perisic": "hr",
  "Marcelo Brozovic": "hr",
  "Lisandro Martinez": "ar",
  "Paul Pogba": "fr",
  "Jadon Sancho": "gb-eng",
  "Mason Mount": "gb-eng",
  "Reece James": "gb-eng",
  "Ben Chilwell": "gb-eng",
  "John McGinn": "gb-sct",
  "Scott McTominay": "gb-sct",
  "Kieran Tierney": "gb-sct",
  "Brennan Johnson": "gb-wls",
  "Richarlison": "br",
  "Lucas Paqueta": "br",
  "Antony": "br",
  "Gabriel Martinelli": "br",
  "Gabriel Jesus": "br",
  "Alejandro Garnacho": "ar",
  "Cristian Romero": "ar",
  "Emiliano Buendia": "ar",
  "Rodrigo De Paul": "ar",
  "Leandro Paredes": "ar",
  "Angel Correa": "ar",
  "Paulo Dybala": "ar",
  "Joao Felix": "pt",
  "Goncalo Ramos": "pt",
  "Joao Cancelo": "pt",
  "Ruben Neves": "pt",
  "Vitinha": "pt",
  "Nuno Mendes": "pt",
  "Pau Torres": "es",
  "Dani Olmo": "es",
  "Mikel Oyarzabal": "es",
  "Ferran Torres": "es",
  "Ansu Fati": "es",
  "Alejandro Balde": "es",
  "Nico Williams": "es",
  "Lamine Yamal": "es",
  "Kai Havertz": "de",
  "Niclas Fullkrug": "de",
  "Julian Brandt": "de",
  "Nico Schlotterbeck": "de",
  "David Raum": "de",
  "Jeremie Frimpong": "nl",
  "Xavi Simons": "nl",
  "Matthijs de Ligt": "nl",
  "Nathan Ake": "nl",
  "Denzel Dumfries": "nl",
  "Teun Koopmeiners": "nl",
  "Memphis Depay": "nl",
  "Romelu Lukaku": "be",
  "Jeremy Doku": "be",
  "Leandro Trossard": "be",
  "Youri Tielemans": "be",
  "Amadou Onana": "be",
  "Lois Openda": "be",
  "Timothy Castagne": "be",
  "Arthur Theate": "be"
};

try {
  let players = JSON.parse(fs.readFileSync(playersPath, 'utf8'));
  
  players = players.map(p => {
    if (nationMap[p.name]) {
      p.nation = nationMap[p.name];
    } else {
      // Dò từ commonPlayers hoặc đặt mặc định
      if (p.name === "Miles Robinson" || p.name === "Walker Zimmerman" || p.name === "Jesus Ferreira" || p.name === "Cristian Roldan" || p.name === "Aaron Long" || p.name === "Sean Johnson" || p.name === "DeAndre Yedlin" || p.name === "Kellyn Acosta" || p.name === "Jordan Morris") {
        p.nation = "us";
      } else if (p.name === "Milan Borjan" || p.name === "Samuel Piette" || p.name === "Junior Hoilett" || p.name === "Lucas Cavallini" || p.name === "Alistair Johnston" || p.name === "Kamal Miller" || p.name === "Richie Laryea") {
        p.nation = "ca";
      } else if (p.name === "Jesus Gallardo" || p.name === "Cesar Montes" || p.name === "Luis Romo" || p.name === "Uriel Antuna" || p.name === "Roberto Alvarado" || p.name === "Henry Martin" || p.name === "Luis Chavez") {
        p.nation = "mx";
      } else if (p.name === "Shuichi Gonda" || p.name === "Miki Yamane" || p.name === "Shogo Taniguchi" || p.name === "Gaku Shibasaki" || p.name === "Yuki Soma" || p.name === "Ayase Ueda" || p.name === "Hiroki Sakai") {
        p.nation = "jp";
      } else if (p.name === "Kim Seung-gyu" || p.name === "Kim Jin-su" || p.name === "Kim Moon-hwan" || p.name === "Jung Woo-young" || p.name === "Kwon Chang-hoon" || p.name === "Na Sang-ho" || p.name === "Cho Gue-sung" || p.name === "Hwang Ui-jo") {
        p.nation = "kr";
      } else if (p.name === "Mathew Ryan" || p.name === "Kye Rowles" || p.name === "Aziz Behich" || p.name === "Jackson Irvine" || p.name === "Aaron Mooy" || p.name === "Craig Goodwin" || p.name === "Mitchell Duke" || p.name === "Riley McGree") {
        p.nation = "au";
      } else if (p.name === "Mohammed Al-Owais" || p.name === "Ali Al-Bulaihi" || p.name === "Saud Abdulhamid" || p.name === "Mohamed Kanno" || p.name === "Salem Al-Dawsari" || p.name === "Firas Al-Buraikan" || p.name === "Saleh Al-Shehri") {
        p.nation = "sa";
      }
    }
    return p;
  });

  // Lưu lại vào file
  fs.writeFileSync(playersPath, JSON.stringify(players, null, 2));
  console.log(`Đã cập nhật quốc tịch thành công cho ${players.length} cầu thủ.`);
} catch (e) {
  console.error("Lỗi cập nhật quốc tịch:", e);
}

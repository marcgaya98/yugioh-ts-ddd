export const VISUAL_CONCEPTS: readonly string[] = [
  'light element', 'dark element', 'water element', 'fire element', 'earth element', 'wind element',
  'dragon', 'warrior', 'spellcaster', 'fiend', 'zombie', 'machine', 'aqua', 'beast',
  'winged creature', 'plant', 'insect', 'rock creature', 'dinosaur', 'fairy', 'serpent',
  'humanoid', 'mechanical', 'demonic', 'angelic', 'undead', 'robotic', 'bestial', 'reptilian',
  'Dark Magician', 'Blue-Eyes', 'Red-Eyes', 'Toon', 'Elemental HERO', 'Destiny HERO',
  'Cyber', 'Ancient Gear', 'Crystal Beast', 'Ojama', 'Neos', 'Vehicroid', 'Amazoness',
  'anime style', 'cartoon style', 'realistic', 'dark artwork', 'bright artwork', 'ethereal',
  'technological', 'mystical', 'chibi style', 'detailed', 'minimalist', 'abstract',
  'fire visual', 'water visual', 'lightning', 'ice', 'stone', 'crystal', 'metal parts',
  'cloth', 'armor', 'robe', 'magic aura', 'energy effect', 'explosion', 'darkness',
  'battlefield', 'castle', 'temple', 'space', 'forest', 'city', 'ruins', 'cave',
  'underwater', 'sky', 'volcanic', 'desert', 'graveyard', 'laboratory', 'void',
  'attacking', 'defending', 'casting spell', 'flying', 'running', 'standing pose',
  'summoning', 'transforming', 'dual wielding', 'riding mount', 'charging energy',
  'sword', 'staff', 'shield', 'armor', 'helmet', 'robe', 'wings', 'claws', 'fangs',
  'horns', 'tentacles', 'gun', 'cannon', 'bow', 'multiple heads', 'crown', 'jewel',
  'glowing', 'shining', 'flaming', 'shadowy', 'sparkling', 'smoky', 'flowing',
  'crystalline', 'ghostly', 'spectral', 'electrified', 'corrupted', 'holy',
  'close-up', 'full body', 'dynamic pose', 'symmetrical', 'asymmetrical',
  'face visible', 'face obscured', 'multiple creatures', 'alone', 'group shot',
  'red dominant', 'blue dominant', 'green dominant', 'black dominant', 'white dominant',
  'purple dominant', 'gold dominant', 'silver dominant', 'orange dominant', 'multicolored',
  'ancient', 'medieval', 'futuristic', 'steampunk', 'cyberpunk', 'egyptian', 'asian',
  'western', 'primitive', 'high-tech',
  'Neo-Spacian', 'Duel Academy', 'Sacred Beast', 'Cyber Art', 'Hero Theme', 'Spirit Key',
  'intimidating', 'heroic', 'friendly', 'mysterious', 'chaotic', 'noble', 'cute',
  'fierce', 'serene', 'menacing', 'playful', 'stoic', 'wise', 'childish'
];

export const SPANISH_TO_ENGLISH_VISUAL_TERMS: Readonly<Record<string, string>> = {
  guerrero: 'warrior',
  dragon: 'dragon',
  dragón: 'dragon',
  espada: 'sword',
  armadura: 'armor',
  fuego: 'fire',
  rojo: 'red',
  monstruo: 'monster',
  mecánico: 'mechanical',
  cañones: 'cannon',
  hada: 'fairy',
  alas: 'wings',
  brillante: 'bright',
  brillantes: 'bright',
  criatura: 'creature',
  egipcia: 'egyptian',
  egipcio: 'egyptian',
  antigua: 'ancient',
  antiguo: 'ancient',
  héroe: 'hero',
  capa: 'cape',
  vestido: 'robe',
  magia: 'magic',
  oscura: 'dark',
  acuático: 'aquatic',
  submarino: 'underwater',
  azul: 'blue',
  negro: 'black',
  blanco: 'white',
  verde: 'green',
  amarillo: 'yellow',
  púrpura: 'purple',
  dorado: 'gold',
  plateado: 'silver',
  agua: 'water',
  tierra: 'earth',
  viento: 'wind',
  oscuro: 'dark',
  luz: 'light',
  máquina: 'machine',
  bestia: 'beast',
  demonio: 'fiend',
  zombie: 'zombie',
  planta: 'plant',
  insecto: 'insect',
  dinosaurio: 'dinosaur'
};

export const VISUAL_QUERY_STOP_WORDS = new Set([
  'a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'lo', 'los',
  'o', 'para', 'por', 'sin', 'su', 'sus', 'un', 'una', 'uno', 'unos', 'unas', 'y',
  'and', 'in', 'of', 'on', 'or', 'the', 'to', 'with'
]);

export const VISUAL_STYLE_PRESETS: Readonly<Record<string, string>> = {
  'ghost-rare': 'ethereal ghostly transparent',
  'dark-magician': 'dark magician spellcaster purple robe',
  'blue-dragon': 'blue dragon white powerful'
};

export const DEFAULT_SEMANTIC_TEST_QUERIES: readonly string[] = [
  'vestido rojo',
  'dragón azul',
  'guerrero con armadura',
  'magia oscura'
];


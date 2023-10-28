export const data = {
  cards: [
    {
      content: `The word ‘Ustaad’ entered the Urdu language from Persian. Its journey began with the religious Zoroastrian book Awista, which was in the ancient Iranian language and had very few people who understood it. The person who understood Awista was known as ‘Awista-wed’. The word ‘wed’ is still used for ‘Hakim (wise)’, or ‘Daanaa (learned)’. Gradually, the word first became ‘Awista-wid’, and then morphed into ‘Ustaad’. Originally, the word was used only for those who understood religious texts, but later became an appellation for everyone who taught and tutored. Nowadays, a master of an art or a skill is referred to as Ustaad, too. The word has become an inseparable part of the names of the virtuosos of Indian classical music. Today, in everyday speech, the word has taken a new meaning; being artful has come to be known as Ustaadi dikhaana. Endearingly, friends too address each other as Ustaad these days. In Indian films, characters of all sorts are depicted as Ustads, and films named ‘Ustadon ke Ustad’, ‘Do Ustad’, and ‘Ustadi, Ustad Ki’ are also found.`,
      img: "/logo.svg",
      link: "See More",
      bgGradient: "linear-gradient(45deg, orange, green)",
    },
    {
      content: `no I dont' know`,
      img: "/logo.svg",
      link: "See More",
      bgGradient: "linear-gradient(45deg, #e6e6e6, #f2f2f2)",
    },
    {
      content: `The word ‘Ustaad’ entered the Urdu language from Persian. Its journey began with the religious Zoroastrian book Awista, which was in the ancient Iranian language and had very few people who understood it. The person who understood Awista was known as ‘Awista-wed’. The word ‘wed’ is still used for ‘Hakim (wise)’, or ‘Daanaa (learned)’. Gradually, the word first became ‘Awista-wid’, and then morphed into ‘Ustaad’. Originally, the word was used only for those who understood religious texts, but later became an appellation for everyone who taught and tutored. Nowadays, a master of an art or a skill is referred to as Ustaad, too. The word has become an inseparable part of the names of the virtuosos of Indian classical music. Today, in everyday speech, the word has taken a new meaning; being artful has come to be known as Ustaadi dikhaana. Endearingly, friends too address each other as Ustaad these days. In Indian films, characters of all sorts are depicted as Ustads, and films named ‘Ustadon ke Ustad’, ‘Do Ustad’, and ‘Ustadi, Ustad Ki’ are also found.`,
      img: "",
      link: "See More",
      bgGradient: "linear-gradient(45deg, #e6e6e6, #f2f2f2)",
    },
    // Add more cards as needed
  ],
  addCard: (newCard: {
    content: string;
    img: string;
    link: string;
    bgGradient: string;
  }) => {
    data.cards.push(newCard);
  },
  deleteCard: (index: number) => {
    data.cards.splice(index, 1);
  },
  updateCard: (
    index: number,
    updatedCard: {
      content: string;
      img: string;
      link: string;
      bgGradient: string;
    }
  ) => {
    data.cards[index] = updatedCard;
  },
};

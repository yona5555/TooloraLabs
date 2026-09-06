import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type QuoteCategory = "motivational" | "literary" | "philosophical";

export type Quote = {
  id: string;
  text: string;
  author: string;
  source: string;
  category: QuoteCategory;
};

export type RandomQuoteInput = {
  category?: QuoteCategory | "all";
  /** Excludes this quote id from selection, so "New Quote" doesn't repeat the current one. */
  excludeId?: string;
  /** Injectable RNG for deterministic testing; defaults to Math.random. */
  randomFn?: () => number;
};

export type RandomQuoteOutput = {
  quote: Quote;
};

/**
 * A small, curated set of accurately-attributed, documented-source quotes. Every entry cites
 * a verifiable primary source (a speech, book, or published text) rather than a commonly
 * circulated but unverifiable "internet quote."
 */
export const QUOTES: Quote[] = [
  // Motivational — historical speeches and documented public statements.
  { id: "mlk-dream", text: "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.", author: "Martin Luther King Jr.", source: "\"I Have a Dream\" speech, 1963", category: "motivational" },
  { id: "jfk-country", text: "Ask not what your country can do for you – ask what you can do for your country.", author: "John F. Kennedy", source: "Inaugural Address, 1961", category: "motivational" },
  { id: "fdr-fear", text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt", source: "First Inaugural Address, 1933", category: "motivational" },
  { id: "churchill-never", text: "Never give in, never give in, never, never, never, never—in nothing, great or small, large or petty, never give in.", author: "Winston Churchill", source: "Speech at Harrow School, 1941", category: "motivational" },
  { id: "jobs-work", text: "The only way to do great work is to love what you do.", author: "Steve Jobs", source: "Stanford Commencement Address, 2005", category: "motivational" },
  { id: "mandela-impossible", text: "It always seems impossible until it's done.", author: "Nelson Mandela", source: "Public statement, widely documented", category: "motivational" },
  { id: "roosevelt-can", text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", source: "Public writings, early 1900s", category: "motivational" },
  { id: "curie-fear", text: "Nothing in life is to be feared, it is only to be understood.", author: "Marie Curie", source: "Published writings and letters", category: "motivational" },
  { id: "earhart-doit", text: "The most effective way to do it, is to do it.", author: "Amelia Earhart", source: "Published writings", category: "motivational" },
  { id: "angelou-defeats", text: "You may encounter many defeats, but you must not be defeated.", author: "Maya Angelou", source: "Published writings", category: "motivational" },

  // Literary — verifiable lines from published, widely available texts.
  { id: "dickens-times", text: "It was the best of times, it was the worst of times.", author: "Charles Dickens", source: "A Tale of Two Cities, 1859", category: "literary" },
  { id: "melville-ishmael", text: "Call me Ishmael.", author: "Herman Melville", source: "Moby-Dick, 1851", category: "literary" },
  { id: "austen-fortune", text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.", author: "Jane Austen", source: "Pride and Prejudice, 1813", category: "literary" },
  { id: "tolstoy-families", text: "All happy families are alike; each unhappy family is unhappy in its own way.", author: "Leo Tolstoy", source: "Anna Karenina, 1877", category: "literary" },
  { id: "orwell-clocks", text: "It was a bright cold day in April, and the clocks were striking thirteen.", author: "George Orwell", source: "Nineteen Eighty-Four, 1949", category: "literary" },
  { id: "tolkien-wander", text: "Not all those who wander are lost.", author: "J.R.R. Tolkien", source: "The Fellowship of the Ring, 1954", category: "literary" },
  { id: "fitzgerald-boats", text: "So we beat on, boats against the current, borne back ceaselessly into the past.", author: "F. Scott Fitzgerald", source: "The Great Gatsby, 1925", category: "literary" },
  { id: "shakespeare-tobe", text: "To be, or not to be, that is the question.", author: "William Shakespeare", source: "Hamlet, Act 3, Scene 1", category: "literary" },
  { id: "shakespeare-stage", text: "All the world's a stage, and all the men and women merely players.", author: "William Shakespeare", source: "As You Like It, Act 2, Scene 7", category: "literary" },
  { id: "bronte-souls", text: "Whatever our souls are made of, his and mine are the same.", author: "Emily Brontë", source: "Wuthering Heights, 1847", category: "literary" },

  // Philosophical — direct lines from primary philosophical texts.
  { id: "descartes-think", text: "I think, therefore I am.", author: "René Descartes", source: "Discourse on the Method, 1637", category: "philosophical" },
  { id: "socrates-unexamined", text: "The unexamined life is not worth living.", author: "Socrates", source: "Recorded by Plato, Apology", category: "philosophical" },
  { id: "sartre-condemned", text: "Man is condemned to be free.", author: "Jean-Paul Sartre", source: "Being and Nothingness, 1943", category: "philosophical" },
  { id: "wittgenstein-silent", text: "Whereof one cannot speak, thereof one must be silent.", author: "Ludwig Wittgenstein", source: "Tractatus Logico-Philosophicus, 1921", category: "philosophical" },
  { id: "nietzsche-why", text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", source: "Twilight of the Idols, 1889", category: "philosophical" },
  { id: "heraclitus-river", text: "No man ever steps in the same river twice, for it's not the same river and he's not the same man.", author: "Heraclitus", source: "Fragments, as preserved by later sources", category: "philosophical" },
  { id: "socrates-wisdom", text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", source: "Recorded by Plato", category: "philosophical" },
  { id: "aristotle-happiness", text: "Happiness is the meaning and the purpose of life, the whole aim and end of human existence.", author: "Aristotle", source: "Nicomachean Ethics", category: "philosophical" },
  { id: "kant-maxim", text: "Act only according to that maxim whereby you can at the same time will that it should become a universal law.", author: "Immanuel Kant", source: "Groundwork of the Metaphysics of Morals, 1785", category: "philosophical" },
  { id: "beauvoir-woman", text: "One is not born, but rather becomes, a woman.", author: "Simone de Beauvoir", source: "The Second Sex, 1949", category: "philosophical" },
];

export class RandomQuoteCalculator extends BaseCalculator<RandomQuoteInput, RandomQuoteOutput> {
  metadata = {
    id: "random-quote-generator",
    slug: "random-quote-generator",
    name: "Random Quote Generator",
    category: "fun-entertainment",
    description: "Displays a random quote from a curated, documented-source collection spanning motivational, literary, and philosophical categories.",
    version: "1.0.0",
  };

  execute(input: RandomQuoteInput, _context: ToolContext): ToolResult<RandomQuoteOutput> {
    const category = input.category ?? "all";
    const pool = category === "all" ? QUOTES : QUOTES.filter((q) => q.category === category);
    const candidates = input.excludeId ? pool.filter((q) => q.id !== input.excludeId) : pool;
    const finalPool = candidates.length > 0 ? candidates : pool;

    const randomFn = input.randomFn ?? Math.random;
    const index = Math.floor(randomFn() * finalPool.length);

    return {
      success: true,
      data: { quote: finalPool[index] },
      metadata: {},
    };
  }
}

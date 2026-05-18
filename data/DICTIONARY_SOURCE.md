# Dictionary Source

`data/words.txt` is generated from the official ESDB/SCOWL-derived large American and British English wordlists:

- `en_US-large.txt`
- `en_GB-large.txt`

Source project:

- https://wordlist.aspell.net/
- https://github.com/en-wl/wordlist-diff

For this game, the merged list is filtered to plain lowercase alphabetic words before being loaded, which keeps broad US and British English coverage while excluding abbreviations, punctuation forms, and other entries that are a poor fit for a letter-grid party game.

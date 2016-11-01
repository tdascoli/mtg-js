# Mana v1.2.0

## The Magic: the Gathering mana symbol font!

Mana is a complete set of Magic: the Gathering mana, tap, and card type symbols as a pictographic font. You can use this font anywhere you want to display mana and tap symbols&mdash;in your MtG app or website, documents, card images, anything!

## Usage

Each mana symbol has its own font character. Display them in a manner similar to [Keyrune](http://andrewgioia.github.io/Keyrune) using the `<i class="ms ms-g"></i>` element and class syntax. Class name codes are based on textual mana symbol codes (like g for Green or 3 for, well, {3}).

To use Mana, move the web font files to your `/fonts` directory and include the mana.css stylesheet in your `<head>`:

```html
<link href="css/mana.css" rel="stylesheet" type="text/css" />
```

## Editing the Source

Feel free to edit the source files and compile Mana to fit your needs. Currently LESS is supported, with Sass coming soon.

## License

All mana, tap, and card type symbol images are copyright Wizards of the Coast ([http://magicthegathering.com](http://magicthegathering.com))

The Mana font is licensed under the the SIL OFL 1.1 ([http://scripts.sil.org/OFL](http://scripts.sil.org/OFL))

Mana CSS, LESS, and Sass files are licensed under the MIT License ([http://opensource.org/licenses/mit-license.html](http://opensource.org/licenses/mit-license.html))

Attribution is **greatly appreciated** but not required!

## Changelog

* v0.1 - initial font creation and CSS/LESS files added
* v0.2 - Flashback symbol added
* v0.3 - phyrexian mana classes use MTGJson standard; project-specific LESS prefix added (@JayGray)
* v0.4 - adding classes for 16, 17, 18, 19, and 20 symbols
* v0.5 - adding the new colorless wastes symbol
* v0.6 - adding double-faced card symbols (day, night)
* v1.0 - new documentation page at http://andrewgioia.github.io/Mana/
* v1.0.1 - added classes for -12 and -14 loyalty (sorry Jace and Karn!)
* v1.1.0 - added the new Energy symbol
* v1.2.0 - added DFC symbols for the Origins planeswalkers (ignite and spark) and the Eldritch Moon meld cards (emrakul and moon)

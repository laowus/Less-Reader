## epub_player.dart

    String replaceSingleQuote(String value) {
         return value.replaceAll("'", "\\'");
    }

    1. book的cfi: widget.book.lastReadPositio
    let initialCfi = '${replaceSingleQuote(cfi)}'
     let style = {
         fontSize: ${bookStyle.fontSize},//字体
         fontName: '${replaceSingleQuote(fontName)}',// 字体名字
         fontPath: '${replaceSingleQuote(fontPath)}',//字体路径
         letterSpacing: ${bookStyle.letterSpacing},//字体间距
         spacing: ${bookStyle.lineHeight},//
         paragraphSpacing: ${bookStyle.paragraphSpacing},//
         textIndent: ${bookStyle.indent},//
         fontColor: '#$textColor',//
         backgroundColor: '#$backgroundColor',//
         topMargin: ${bookStyle.topMargin},
         bottomMargin: ${bookStyle.bottomMargin},
         sideMargin: ${bookStyle.sideMargin},
         justify: true,//
         hyphenate: true,//
         pageTurnStyle: '${Prefs().pageTurnStyle.name}',//
         maxColumnCount: ${bookStyle.maxColumnCount},
     }

数据滚动

book

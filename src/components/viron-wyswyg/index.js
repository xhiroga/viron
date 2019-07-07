import throttle from 'mout/function/throttle';
import ObjectAssign from 'object-assign';
import './explorer/index.tag';

export default function() {
  const store = this.riotx.get();
  const isMobile = store.getter('layout.isMobile');

  // TODO: オプションしっかり調べること。
  FroalaEditor.DefineIcon('openExplorer', {
    NAME: 'plus', SVG_KEY: 'add'
  });
  FroalaEditor.RegisterCommand('openExplorer', {
    title: 'Insert Media',
    focus: true,
    undo: true,
    refreshAfterCallback: true,
    callback: () => {
      const explorerDef = this.opts.explorer;
      store.action('drawers.add', 'viron-wyswyg-explorer', {
        def: explorerDef,
        onInsert: item => {
          this.editor.html.insert(`<img src="${item.url}" width="100%" />`);
        }
      }, { isWide: true });
    }
  });

  this.editor = null;
  this.options = {
    // デフォのボタン群にカスタムボタンを加える。
    // @see: https://www.froala.com/wysiwyg-editor/docs/options#toolbarButtons
    toolbarButtons: {
      'moreText': {
        'buttons': ['openExplorer', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'backgroundColor', 'inlineClass', 'inlineStyle', 'clearFormatting']
      },
      'moreParagraph': {
        'buttons': ['alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'formatUL', 'paragraphFormat', 'paragraphStyle', 'lineHeight', 'outdent', 'indent', 'quote']
      },
      'moreRich': {
        'buttons': ['insertLink', 'insertImage', 'insertVideo', 'insertTable', 'emoticons', 'fontAwesome', 'specialCharacters', 'embedly', 'insertFile', 'insertHR']
      },
      'moreMisc': {
        'buttons': ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help'],
        'align': 'right',
        'buttonsVisible': 2
      }
    },
    events: {
      blur: () => {
        this.handleEditorBlur();
      },
      focus: () => {
        this.handleEditorFocus();
      },
      contentChanged: () => {
        this.handleEditorChange();
      }
    }
  };

  this.on('mount', () => {
    if (this.opts.ispreview) {
      return;
    }
    this.editor = new FroalaEditor(`.Wyswyg__editor${this._riot_id}`, this.options, () => {
      !!this.opts.val && this.editor.html.set(this.opts.val);
    });
  }).on('before-unmount', () => {
    if (this.opts.ispreview) {
      return;
    }
    if (!!this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  });

  // 発火回数を間引く。
  this.handleEditorChange = throttle(() => {
    if (!this.opts.onchange) {
      return;
    }
    const html = this.editor.html.get();
    this.opts.onchange(html);
  }, 500);

  this.handleEditorFocus = () => {
    if (!this.opts.onfocus) {
      return;
    }
    this.opts.onfocus();
  };

  this.handleEditorBlur = () => {
    if (!!this.opts.onchange) {
      const html = this.editor.html.get();
      this.opts.onchange(html);
    }
    if (!this.opts.onblur) {
      return;
    }
    this.opts.onblur();
  };

  this.handleBlockerTap = e => {
    e.stopPropagation();
  };
}

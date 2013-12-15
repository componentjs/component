module.exports = function anonymous(obj
/**/) {

  function escape(html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  function section(obj, prop, negate, str) {
    var val = obj[prop];
    if ('function' == typeof val) return val.call(obj, str);
    if (negate) val = !val;
    if (val) return str;
    return '';
  };

  return "\n# " + escape(obj.name) + "\n\n  " + escape(obj.desc) + "\n\n## Installation\n\n  Install with [component(1)](http://component.io):\n\n    $ component install " + escape(obj.repo) + "\n\n## API\n\n\n\n## License\n\n  The MIT License (MIT)\n\n  Copyright (c) " + escape(obj.year) + " <copyright holders>\n\n  Permission is hereby granted, free of charge, to any person obtaining a copy\n  of this software and associated documentation files (the \"Software\"), to deal\n  in the Software without restriction, including without limitation the rights\n  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n  copies of the Software, and to permit persons to whom the Software is\n  furnished to do so, subject to the following conditions:\n\n  The above copyright notice and this permission notice shall be included in\n  all copies or substantial portions of the Software.\n\n  THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n  THE SOFTWARE."
}
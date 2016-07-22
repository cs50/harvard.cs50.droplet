console.log('The define() call is running.');
define(function(require, exports, module) {
  console.log('The initial script is running.');
  var droplet = require('./droplet/dist/droplet-full.js');
  require('./jquery.min.js');
  var $ = jQuery;
  var tooltipster = require('./tooltipster/dist/js/tooltipster.bundle.js');

  var worker = null;

  function createWorker(mod) {
      // nameToUrl is renamed to toUrl in requirejs 2
      if (require.nameToUrl && !require.toUrl)
          require.toUrl = require.nameToUrl;

      var workerUrl = workerUrl || require.toUrl(mod);

      console.log('USING WORKER URL', workerUrl);

      try {
          return new Worker(workerUrl);
      } catch(e) {
          if (e instanceof window.DOMException) {
              // Likely same origin problem. Use importScripts from a shim Worker
              var blob = workerBlob(workerUrl);
              var URL = window.URL || window.webkitURL;
              var blobURL = URL.createObjectURL(blob);

              console.log('blobURL', blobURL);

              var worker = new Worker(blobURL);

              setTimeout(function() { // IE EDGE needs a timeout here
                  URL.revokeObjectURL(blobURL);
              });

              return worker;
          } else {
              throw e;
          }
      }
  };

  function workerBlob(url) {
    // workerUrl can be protocol relative
    // importScripts only takes fully qualified urls
    var script = "importScripts('" + url + "');";
    try {
        return new Blob([script], {"type": "application/javascript"});
    } catch (e) { // Backwards-compatibility
        var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        var blobBuilder = new BlobBuilder();
        blobBuilder.append(script);
        return blobBuilder.getBlob("application/javascript");
    }
  }

  var OPT_MAP = {
    'ace/mode/c_cpp': {
      "mode": "c_cpp",
      "viewSettings": {
        "padding": 10
      },
      "palette": [
        {
          "name": "Control Flow",
          "color": "orange",
          "blocks": [
            {
              "block": "int main(void)\n{\n  \n}",
              "context": "externalDeclaration",
              "title": "<p><code>main</code> -- starting point for the program</p>\n<p>The <code>main</code> method. Code inside here <code>{ }</code>\nwill run when your program is run. You must\ninclude a main method in order for your program executable\nto do anything when run.</p>\n"
            },
            {
              "block": "type myMethod(void)\n{\n  \n}",
              "context": "externalDeclaration",
              "title": "<p>method -- reusable procedure</p>\n<p>Defines a method accepting a <code>void</code> (no arguments) and returning\na <code>type</code>. The code inside <code>{ }</code> will not run at first, but will run every time\nyou call <code>myMethod(arguments...)</code>. Use a <code>return</code> statement inside the method\nto pass information back to whoever called it.</p>\n"
            },
            {
              "block": "myMethod(argument);",
              "context": "blockItem",
              "title": "<p>A method call.</p>\n"
            },
            {
              "block": "return 0;",
              "context": "blockItem",
              "title": "<p>return -- give value back from procedure</p>\n<p>A return statement. Use this inside a method\nto pass information back to whoever called it.</p>\n"
            },
            {
              "block": "if (a == b)\n{\n  \n}",
              "context": "blockItem",
              "title": "<p>if -- do something only if a test is true</p>\n<p>An <code>if</code> statement. Only executes the code inside <code>{ }</code>\nif the condition in the parentheses <code>( )</code> is true. Add\nan <code>else</code> or <code>else if</code> using the arrow at the bottom, which\nwill run if the statement isn&#39;t true.</p>\n"
            },
            {
              "block": "while (a < b)\n{\n  \n}",
              "context": "blockItem",
              "title": "<p>while -- do something repeatedly</p>\n<p>Repeatedly executes the code inside <code>{ }</code> until the condition\ninside the parentheses <code>( )</code> is false.</p>\n"
            },
            {
              "block": "for (int i = 0; i < n; i++)\n{\n  \n}",
              "context": "blockItem",
              "title": "<p>for -- iterate over a range</p>\n<p>Repeats the code inside <code>{ }</code> <code>n</code> times. It does this by\nmaking a variable <code>i</code> which increases every repeition until it reaches\n<code>n</code>. You can use <code>i</code> inside the code to tell how many times the loop\nhas already run.</p>\n"
            },
            {
              "block": "break;",
              "context": "blockItem",
              "title": "<p>Break out of a loop before it finishes.</p>\n"
            }
          ]
        },
        {
          "name": "Operations",
          "color": "green",
          "blocks": [
            {
              "block": "type variable = 0;",
              "context": "blockItem",
              "title": "<p>declare a variable</p>\n<p>Declare a variable of type <code>type</code> and name <code>variable</code> with an\ninitial value of <code>0</code>.</p>\n"
            },
            {
              "block": "variable = newValue;",
              "context": "blockItem",
              "title": "<p>reassign a variable</p>\n<p>Assign a new value <code>newValue</code> to the variable with name <code>variable</code>. You must\ndeclare your variable before you can do this.</p>\n"
            },
            {
              "block": "a + b",
              "context": "expression",
              "title": "add two numbers"
            },
            {
              "block": "a - b",
              "context": "expression",
              "title": "subtract two numbers"
            },
            {
              "block": "a * b",
              "context": "expression",
              "title": "multiply two numbers"
            },
            {
              "block": "a / b",
              "context": "expression",
              "title": "<p>divide two numbers</p>\n<p>Divide two numbers. Remember that if you\ndivide two integers, you will get an integer\nanswer that is rounded down.</p>\n"
            },
            {
              "block": "a % b",
              "context": "expression",
              "title": "<p>modulo</p>\n<p>Take the modulo of two numbers. This is the remainder\nwhen you divide <code>a</code> by <code>b</code>.</p>\n"
            },
            {
              "block": "a == b",
              "context": "expression",
              "title": "test if two numbers are equal"
            },
            {
              "block": "a != b",
              "context": "expression",
              "title": "test if two numbers are not equal"
            },
            {
              "block": "a < b",
              "context": "expression",
              "title": "<p>compare two numbers</p>\n<p>Test if <code>a</code> &lt; <code>b</code>.</p>\n"
            },
            {
              "block": "a > b",
              "context": "expression",
              "title": "<p>compare two numbers</p>\n<p>Test if <code>a</code> &gt; <code>b</code>.</p>\n"
            },
            {
              "block": "a || b",
              "context": "expression",
              "title": "<p>logical or</p>\n<p>This will be true if the condition\nin <code>a</code> is true, the condition in <code>b</code> is true, or both.</p>\n"
            },
            {
              "block": "a && b",
              "context": "expression",
              "title": "<p>logical and</p>\n<p>This will be true only if the condition\nin <code>a</code> is true and the condition in <code>b</code> is true.</p>\n"
            }
          ]
        },
        {
          "name": "cs50.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <cs50.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>cs50.h</code>. You must put this\nin your program in order to use any of the <code>cs50.h</code> blocks.</p>\n"
            },
            {
              "block": "GetString();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/cs50.h/GetString\" target=\"_blank\">GetString</a> - returns a string from stdin</p>\n<p>Reads a line of text from standard input and returns it as a <code>string</code> (<code>char *</code>), sans trailing newline character. (Ergo, \nif user inputs only <code>&quot;\\n&quot;</code>, returns &quot;&quot; not <code>NULL</code>.)  Returns <code>NULL</code> upon error or no input whatsoever (i.e., just <code>EOF</code>). \nLeading and trailing whitespace is not ignored. Stores <code>string</code> on heap (via <code>malloc</code>); memory must be freed by caller to \navoid leak.</p>\n"
            },
            {
              "block": "GetLongLong();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/cs50.h/GetLongLong\" target=\"_blank\">GetLongLong</a> - returns a long long from stdin</p>\n<p>Reads a line of text from standard input and returns an equivalent <code>long long</code> in the range [-2^63^ + 1, 2^63^ - 2], if \npossible; if text does not represent such a <code>long long</code>, user is prompted to retry. Leading and trailing whitespace is \nignored. For simplicity, overflow is not detected. If line can&#39;t be read, returns <code>LLONG_MAX</code>.</p>\n"
            },
            {
              "block": "GetInt();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/cs50.h/GetInt\" target=\"_blank\">GetInt</a> - returns an int from stdin</p>\n<p>Reads a line of text from standard input and returns it as an <code>int</code> in the range of [-2^31^ + 1, 2^31^ - 2], if possible; \nif text does not represent such an <code>int</code>, user is prompted to retry. Leading and trailing whitespace is ignored. For \nsimplicity, overflow is not detected. If line can&#39;t be read, returns <code>INT_MAX</code>.</p>\n"
            },
            {
              "block": "GetFloat();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/cs50.h/GetFloat\" target=\"_blank\">GetFloat</a> - returns a float from stdin</p>\n<p>Reads a line of text from standard input and returns the equivalent <code>float</code> as precisely as possible; if text does not \nrepresent a <code>float</code>, user is prompted to retry. Leading and trailing whitespace is ignored. For simplicity, overflow \nand underflow are not detected.  If line can&#39;t be read, returns <code>FLT_MAX</code>.</p>\n"
            },
            {
              "block": "GetDouble();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/cs50.h/GetDouble\" target=\"_blank\">GetDouble</a> - returns a double from stdin</p>\n<p>Reads a line of text from standard input and returns the equivalent <code>double</code> as precisely as possible; if text does not \nrepresent a <code>double</code>, user is prompted to retry. Leading and trailing whitespace is ignored. For simplicity, overflow \nand underflow are not detected. If line can&#39;t be read, returns <code>DBL_MAX</code>.</p>\n"
            },
            {
              "block": "GetChar();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/cs50.h/GetChar\" target=\"_blank\">GetChar</a> - returns a char from stdin</p>\n<p>Reads a line of text from standard input and returns the equivalent <code>char</code>; if text does not represent a <code>char</code>, user is \nprompted to retry. Leading and trailing whitespace is ignored. If line can&#39;t be read, returns <code>CHAR_MAX</code>.</p>\n"
            }
          ]
        },
        {
          "name": "stdio.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <stdio.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>stdio.h</code>. You must put this\nin your program in order to use any of the <code>stdio.h</code> blocks.</p>\n"
            },
            {
              "block": "sprintf(ptr, format);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/sprintf\" target=\"_blank\">sprintf</a> - send formatted output to a string</p>\n<p><code>sprintf</code> stores in <code>ptr</code> a string formatted along the lines of <code>format</code>.</p>\n"
            },
            {
              "block": "scanf(format);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/scanf\" target=\"_blank\">scanf</a> - read in a formatted string from stdin</p>\n<p><code>scanf</code> reads in from <code>stdin</code> (usually your keyboard) input that matches \n<code>format</code>. Notice, this function is almost identical to <code>fscanf</code> except it \nis missing the first argument <code>FILE* fp</code>. This is because <code>scanf</code> just assumes \nthe input is going to be coming from the keyboard. (<a href=\"https://reference.cs50.net/stdio.h/scanf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "printf(format);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/printf\" target=\"_blank\">printf</a> - prints to stdout</p>\n<p><code>printf</code> prints some formatted output to <code>stdout</code> (your computer terminal).\nYou specify the format with a <code>%</code> followed by a <code>c</code> for a character, <code>d</code> for\na digit, and <code>s</code> for a string. There are a number of other identifiers, the\naformentioned, however, are the most used. (<a href=\"https://reference.cs50.net/stdio.h/printf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "fwrite(ptr, size, blocks, fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fwrite\" target=\"_blank\">fwrite</a> - write to a file</p>\n<p>Similar to <code>fread</code>, <code>fwrite</code> writes out to file <code>fp</code> an element of <code>size</code> bytes \n<code>blocks</code> number of times. So, for example, if <code>size</code> is 50 and <code>blocks</code> 10, then \n<code>fwrite</code> will write to <code>fp</code> 10 times, each time a &quot;chunk&quot; of 50 bytes (for a total \nof 500 bytes). On each <code>fwrite</code>, it will write from the buffer pointer to by <code>ptr</code>.</p>\n"
            },
            {
              "block": "fseek(fp, offset, from_where);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fseek\" target=\"_blank\">fseek</a> - sets file position</p>\n<p>Use <code>fseek</code> when you want to change the offset of the file pointer <code>fp</code>.\nThis is an extremely useful tool. Normally, when reading in from a file, \nthe pointer continues in one direction, from the start of the file to the\nend. <code>fseek</code>, however, allows you to change the location of the file pointer. (<a href=\"https://reference.cs50.net/stdio.h/fseek\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "fscanf(fp, format);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fscanf\" target=\"_blank\">fscanf</a> - read in a formatted string</p>\n<p><code>fscanf</code> reads in from file <code>fp</code> input that matches <code>format</code>.</p>\n"
            },
            {
              "block": "fread(ptr, size, blocks, fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fread\" target=\"_blank\">fread</a> - read from a file</p>\n<p><code>fread</code> reads in from file <code>fp</code> an element of <code>size</code> bytes <code>blocks</code> number of\ntimes. So, for example, if <code>size</code> is 50 and <code>blocks</code> 10, then <code>fread</code> will read\nin from <code>fp</code> 10 times, each time reading in 50 bytes (for a total of 500 bytes).\nOn each <code>fread</code>, it will store the bytes in a buffer pointer to by <code>ptr</code>.</p>\n"
            },
            {
              "block": "fputs(s, fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fputs\" target=\"_blank\">fputs</a> - write a string to a file</p>\n<p><code>fputs</code> is used to write a null terminated string <code>s</code> to file <code>fp</code>.</p>\n"
            },
            {
              "block": "fputc(character, fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fputc\" target=\"_blank\">fputc</a> - write a character to a file</p>\n<p>Used to write a single character to a file.</p>\n"
            },
            {
              "block": "fprintf(fp, format);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fprintf\" target=\"_blank\">fprintf</a> - print out a formatted string</p>\n<p>Used to print to a file in a specific, formatted fashion, <code>fprintf</code> prints\nto the file <code>fp</code> as the string <code>format</code> indicates.</p>\n"
            },
            {
              "block": "fopen(filename, mode);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fopen\" target=\"_blank\">fopen</a> - opens a file</p>\n<p><code>fopen</code> opens file <code>filename</code> in the specified <code>mode</code>. The <code>mode</code> can be a\nnumber of things, however, the most common are <code>r</code> for reading, <code>w</code> for\nwriting, and <code>a</code> for appending. It should be noted, if you are opening a file\nto read using <code>r</code> then that file MUST exist, otherwise <code>fopen</code> will return \n<code>NULL</code>, something you should check for. Writing with <code>w</code> will create an empty \nfile even if one of the same name already exists, so be careful! Appending \nwith <code>a</code> will append data to the end of an already present file, or create an \nempty file if <code>filename</code> doesn&#39;t exist.</p>\n"
            },
            {
              "block": "fgets(s, i, fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fgets\" target=\"_blank\">fgets</a> - get the next string from a file</p>\n<p><code>fgets</code> reads in, at most, <code>i</code> characters from file <code>fp</code>, storing them \ntemporarily in buffer <code>s</code>.</p>\n"
            },
            {
              "block": "fgetc(fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fgetc\" target=\"_blank\">fgetc</a> - get the next character from a file</p>\n<p>Gets the next character from a file.</p>\n"
            },
            {
              "block": "feof(fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/feof\" target=\"_blank\">feof</a> - checks whether pointer to file has reached the end of the file</p>\n<p>Checks whether pointer to file has reached the end of the file.</p>\n"
            },
            {
              "block": "fclose(fp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fclose\" target=\"_blank\">fclose</a> - close an open file</p>\n<p>Closes the current file pointed to by file pointer <code>fp</code>.</p>\n"
            },
            {
              "block": "clearerr(stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/clearerr\" target=\"_blank\">clearerr</a> - check and reset stream status</p>\n<p>The function clearerr() clears the end-of-file and error indicators for the stream pointed to by <code>stream</code>. (<a href=\"https://reference.cs50.net/stdio.h/clearerr\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "ferror(stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/ferror\" target=\"_blank\">ferror</a> - check and reset stream status</p>\n<p>The function ferror() tests the error indicator for the stream pointed to by <code>stream</code>, returning nonzero if it is set. The error indicator can be reset only by the clearerr() function. (<a href=\"https://reference.cs50.net/stdio.h/ferror\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "fflush(stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fflush\" target=\"_blank\">fflush</a> - flush a stream</p>\n<p>For output streams, fflush() forces a write of all user-space buffered data for the given output or update <code>stream</code> via the stream&#39;s underlying write function. For input streams, fflush() discards any buffered data that has been fetched from the underlying file, but has not been consumed by the application. The open status of the stream is unaffected. (<a href=\"https://reference.cs50.net/stdio.h/fflush\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "fgetpos(stream, pos);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fgetpos\" target=\"_blank\">fgetpos</a> - reposition a stream</p>\n<p>The fgetpos() and fsetpos() functions are alternate interfaces equivalent to ftell() and fseek() (with <code>whence</code> set to *SEEK_SET*), setting and storing the current value of the file offset into or from the object referenced by <code>pos</code>. On some non-UNIX systems, an <code>fpos_t</code> object may be a complex object and these routines may be the only way to portably reposition a text stream.\n  (<a href=\"https://reference.cs50.net/stdio.h/fgetpos\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "fsetpos(stream, pos);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/fsetpos\" target=\"_blank\">fsetpos</a> - reposition a stream</p>\n<p>The fgetpos() and fsetpos() functions are alternate interfaces equivalent to ftell() and fseek() (with <code>whence</code> set to *SEEK_SET*), setting and storing the current value of the file offset into or from the object referenced by <code>pos</code>. On some non-UNIX systems, an <code>fpos_t</code> object may be a complex object and these routines may be the only way to portably reposition a text stream.\n  (<a href=\"https://reference.cs50.net/stdio.h/fsetpos\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "ftell(stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/ftell\" target=\"_blank\">ftell</a> - reposition a stream</p>\n<p>The ftell() function obtains the current value of the file position indicator for the stream pointed to by <code>stream</code>. (<a href=\"https://reference.cs50.net/stdio.h/ftell\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "getc(stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/getc\" target=\"_blank\">getc</a> - input of characters and strings</p>\n<p>fgetc() reads the next character from <code>stream</code> and returns it as an <em>unsigned char</em> cast to an <em>int</em>, or *EOF* on end of file or error. (<a href=\"https://reference.cs50.net/stdio.h/getc\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "getchar();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/getchar\" target=\"_blank\">getchar</a> - input of characters and strings</p>\n<p>getchar() is equivalent to *getc(*<em>stdin</em>*)*. (<a href=\"https://reference.cs50.net/stdio.h/getchar\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "gets(s);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/gets\" target=\"_blank\">gets</a> - input of characters and strings</p>\n<p>gets() reads a line from <em>stdin</em> into the buffer pointed to by <code>s</code> until either a terminating newline or *EOF*, which it replaces with a null byte (&#39;\\0&#39;). No check for buffer overrun is performed (see BUGS below). (<a href=\"https://reference.cs50.net/stdio.h/gets\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "perror(s);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/perror\" target=\"_blank\">perror</a> - print a system error message</p>\n<p>The routine perror() produces a message on the standard error output, describing the last error encountered during a call to a system or library function. First (if <code>s</code> is not NULL and <em>*s</em> is not a null byte (&#39;\\0&#39;)) the argument string <code>s</code> is printed, followed by a colon and a blank. Then the message and a new-line. (<a href=\"https://reference.cs50.net/stdio.h/perror\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "putc(c, stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/putc\" target=\"_blank\">putc</a> - output of characters and strings</p>\n<p>fputc() writes the character <code>c</code>, cast to an <em>unsigned char</em>, to <code>stream</code>. (<a href=\"https://reference.cs50.net/stdio.h/putc\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "putchar(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/putchar\" target=\"_blank\">putchar</a> - output of characters and strings</p>\n<p>*putchar(*<code>c</code>*);* is equivalent to *putc(*<code>c</code>*,*<em>stdout</em>*).* (<a href=\"https://reference.cs50.net/stdio.h/putchar\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "puts(s);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/puts\" target=\"_blank\">puts</a> - output of characters and strings</p>\n<p>fputs() writes the string <code>s</code> to <code>stream</code>, without its terminating null byte (&#39;\\0&#39;). (<a href=\"https://reference.cs50.net/stdio.h/puts\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "remove(pathname);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/remove\" target=\"_blank\">remove</a> - remove a file or directory</p>\n<p>remove() deletes a name from the file system. It calls unlink(2) for files, and rmdir(2) for directories. (<a href=\"https://reference.cs50.net/stdio.h/remove\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "rewind(stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/rewind\" target=\"_blank\">rewind</a> - reposition a stream</p>\n<p>The rewind() function sets the file position indicator for the stream pointed to by <code>stream</code> to the beginning of the file. It is equivalent to:\n     ( void ) fseek stream 0L SEEK_SET<br>except that the error indicator for the stream is also cleared (see clearerr(3)). (<a href=\"https://reference.cs50.net/stdio.h/rewind\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "setbuf(stream, buf);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/setbuf\" target=\"_blank\">setbuf</a> - stream buffering operations</p>\n<p>The other three calls are, in effect, simply aliases for calls to setvbuf(). The setbuf() function is exactly equivalent to the call (<a href=\"https://reference.cs50.net/stdio.h/setbuf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "setvbuf(stream, buf, mode, size);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/setvbuf\" target=\"_blank\">setvbuf</a> - stream buffering operations</p>\n<p>The setvbuf() function may be used on any open stream to change its buffer. The <code>mode</code> argument must be one of the following three macros: (<a href=\"https://reference.cs50.net/stdio.h/setvbuf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "snprintf(str, size, format, ___);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/snprintf\" target=\"_blank\">snprintf</a> - formatted output conversion</p>\n<p>The functions in the printf() family produce output according to a <code>format</code> as described below. The functions printf() and vprintf() write output to <em>stdout</em>, the standard output stream; fprintf() and vfprintf() write output to the given output <code>stream</code>; sprintf(), snprintf(), vsprintf() and vsnprintf() write to the character string <code>str</code>. (<a href=\"https://reference.cs50.net/stdio.h/snprintf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "sscanf(str, format, ___);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/sscanf\" target=\"_blank\">sscanf</a> - input format conversion</p>\n<p>The scanf() function reads input from the standard input stream <em>stdin</em>, fscanf() reads input from the stream pointer <code>stream</code>, and sscanf() reads its input from the character string pointed to by <code>str</code>. (<a href=\"https://reference.cs50.net/stdio.h/sscanf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "ungetc(c, stream);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/ungetc\" target=\"_blank\">ungetc</a> - input of characters and strings</p>\n<p>ungetc() pushes <code>c</code> back to <code>stream</code>, cast to <em>unsigned char</em>, where it is available for subsequent read operations. Pushed-back characters will be returned in reverse order; only one pushback is guaranteed. (<a href=\"https://reference.cs50.net/stdio.h/ungetc\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vfprintf(stream, format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vfprintf\" target=\"_blank\">vfprintf</a> - formatted output conversion</p>\n<p>The functions in the printf() family produce output according to a <code>format</code> as described below. The functions printf() and vprintf() write output to <em>stdout</em>, the standard output stream; fprintf() and vfprintf() write output to the given output <code>stream</code>; sprintf(), snprintf(), vsprintf() and vsnprintf() write to the character string <code>str</code>. (<a href=\"https://reference.cs50.net/stdio.h/vfprintf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vfscanf(stream, format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vfscanf\" target=\"_blank\">vfscanf</a> - input format conversion</p>\n<p>The vfscanf() function is analogous to vfprintf(3) and reads input from the stream pointer <code>stream</code> using a variable argument list of pointers (see stdarg(3). The vscanf() function scans a variable argument list from the standard input and the vsscanf() function scans it from a string; these are analogous to the vprintf(3) and vsprintf(3) functions respectively. (<a href=\"https://reference.cs50.net/stdio.h/vfscanf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vprintf(format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vprintf\" target=\"_blank\">vprintf</a> - formatted output conversion</p>\n<p>The functions in the printf() family produce output according to a <code>format</code> as described below. The functions printf() and vprintf() write output to <em>stdout</em>, the standard output stream; fprintf() and vfprintf() write output to the given output <code>stream</code>; sprintf(), snprintf(), vsprintf() and vsnprintf() write to the character string <code>str</code>. (<a href=\"https://reference.cs50.net/stdio.h/vprintf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vscanf(format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vscanf\" target=\"_blank\">vscanf</a> - input format conversion</p>\n<p>The vfscanf() function is analogous to vfprintf(3) and reads input from the stream pointer <code>stream</code> using a variable argument list of pointers (see stdarg(3). The vscanf() function scans a variable argument list from the standard input and the vsscanf() function scans it from a string; these are analogous to the vprintf(3) and vsprintf(3) functions respectively. (<a href=\"https://reference.cs50.net/stdio.h/vscanf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vsnprintf(str, size, format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vsnprintf\" target=\"_blank\">vsnprintf</a> - formatted output conversion</p>\n<p>The functions in the printf() family produce output according to a <code>format</code> as described below. The functions printf() and vprintf() write output to <em>stdout</em>, the standard output stream; fprintf() and vfprintf() write output to the given output <code>stream</code>; sprintf(), snprintf(), vsprintf() and vsnprintf() write to the character string <code>str</code>. (<a href=\"https://reference.cs50.net/stdio.h/vsnprintf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vsprintf(str, format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vsprintf\" target=\"_blank\">vsprintf</a> - formatted output conversion</p>\n<p>The functions in the printf() family produce output according to a <code>format</code> as described below. The functions printf() and vprintf() write output to <em>stdout</em>, the standard output stream; fprintf() and vfprintf() write output to the given output <code>stream</code>; sprintf(), snprintf(), vsprintf() and vsnprintf() write to the character string <code>str</code>. (<a href=\"https://reference.cs50.net/stdio.h/vsprintf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "vsscanf(str, format, ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdio.h/vsscanf\" target=\"_blank\">vsscanf</a> - input format conversion</p>\n<p>The vfscanf() function is analogous to vfprintf(3) and reads input from the stream pointer <code>stream</code> using a variable argument list of pointers (see stdarg(3). The vscanf() function scans a variable argument list from the standard input and the vsscanf() function scans it from a string; these are analogous to the vprintf(3) and vsprintf(3) functions respectively. (<a href=\"https://reference.cs50.net/stdio.h/vsscanf\" target=\"_blank\">read more</a>)</p>\n"
            }
          ]
        },
        {
          "name": "stdlib.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <stdlib.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>stdlib.h</code>. You must put this\nin your program in order to use any of the <code>stdlib.h</code> blocks.</p>\n"
            },
            {
              "block": "srand48(seedval);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/srand48\" target=\"_blank\">srand48</a> - seeds the pseudorandom generator drand48()</p>\n<p>The function <code>srand48()</code> is used to seed, or initialize, the internal buffer of functions such as <code>drand48()</code>. You normally seed <code>drand48()</code> with \nsomething like <code>time(NULL)</code> since this value will always change. If you were to simply call <code>drand48()</code> without seeding it, you&#39;d get the same string\nof &#39;random&#39; doubles back.</p>\n"
            },
            {
              "block": "srand(seed);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/srand\" target=\"_blank\">srand</a> - seed the pseudorandom generator <code>rand</code></p>\n<p>The thing about the function <code>rand</code> is it will generate a &quot;random&quot; integer,\nhowever, if you seed it with the same number, you will get the same &quot;random&quot;\nsequence of numbers. Therefore, we want to seed <code>rand</code> with something that\nalways changes. Often, it makes sense to seed <code>rand</code> with <code>time</code>, as it\nis a variable that will always be changing. We seed the <code>rand</code> function with\n<code>srand</code>.</p>\n"
            },
            {
              "block": "realloc(ptr, size);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/realloc\" target=\"_blank\">realloc</a> - reallocate memory previously allocated</p>\n<p>Reallocate memory that was previously allocated with <code>calloc</code> or <code>malloc</code>. You\ntake the memory block pointed to by <code>ptr</code> and give it a new <code>size</code>.</p>\n"
            },
            {
              "block": "rand();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/rand\" target=\"_blank\">rand</a> - returns a pseudorandom integer</p>\n<p>The function rand() returns a pseudorandom integer between zero and RAND_MAX.</p>\n"
            },
            {
              "block": "malloc(size);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/malloc\" target=\"_blank\">malloc</a> - allocate memory</p>\n<p>Allocate <code>size</code> bytes of memory. Unlike <code>calloc</code>, <code>malloc</code> will not pre-set all\nallocated memory to zero.</p>\n"
            },
            {
              "block": "free(ptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/free\" target=\"_blank\">free</a> - free dynamically allocated memory</p>\n<p>Free takes a pointer to a block of memory on the heap and frees it for future\nuse. Whenever you dynamically allocate memory with something like <code>calloc</code>, \n<code>malloc</code>,or <code>realloc</code>, you have to, when done with the memory, <code>free</code> it. \nOtherwise, you&#39;ll end up with memory leaks.</p>\n"
            },
            {
              "block": "drand48();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/drand48\" target=\"_blank\">drand48</a> - returns a pseudorandom integer using 48-bit integer arithmetic</p>\n<p>The function <code>drand48()</code> returns a pseudorandom non-negative double-precision floating-point value over the interval [0.0, 1.0).</p>\n"
            },
            {
              "block": "calloc(items, size);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/calloc\" target=\"_blank\">calloc</a> - allocate memory and set it to zero</p>\n<p><code>calloc</code> allocates the requested memory and sets it all to zero. So, it will\nallocate  <code>size</code> bytes <code>items</code> number of times. For example, if <code>size</code> is\n4 bytes, and <code>items</code> 10, then <code>calloc</code> will allocate a total of 40 bytes. \nThis differs from <code>malloc</code> which doesn&#39;t set the memory to zero.</p>\n"
            },
            {
              "block": "atoi(str);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/atoi\" target=\"_blank\">atoi</a> - convert a string to an integer</p>\n<p>Use to convert some string <code>str</code> to an integer.</p>\n"
            },
            {
              "block": "abort();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/abort\" target=\"_blank\">abort</a> - cause abnormal process termination</p>\n<p>The abort() first unblocks the <code>SIGABRT</code> signal, and then raises that signal for the calling process. This results in the abnormal termination of the process unless the <code>SIGABRT</code> signal is caught and the signal handler does not return (see longjmp(3)). (<a href=\"https://reference.cs50.net/stdlib.h/abort\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "abs(j);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/abs\" target=\"_blank\">abs</a> - compute the absolute value of an integer</p>\n<p>The abs() function computes the absolute value of the integer argument <code>j</code>. The labs(), llabs() and imaxabs() functions compute the absolute value of the argument <code>j</code> of the appropriate integer type for the function.</p>\n"
            },
            {
              "block": "atexit(function);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/atexit\" target=\"_blank\">atexit</a> - register a function to be called at normal process termination</p>\n<p>The atexit() function registers the given <code>function</code> to be called at normal process termination, either via exit(3) or via return from the program&#39;s <em>main</em>(). Functions so registered are called in the reverse order of their registration; no arguments are passed. (<a href=\"https://reference.cs50.net/stdlib.h/atexit\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "atof(nptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/atof\" target=\"_blank\">atof</a> - convert a string to a double</p>\n<p>The atof() function converts the initial portion of the string pointed to by <code>nptr</code> to <em>double</em>. The behavior is the same as (<a href=\"https://reference.cs50.net/stdlib.h/atof\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "atol(nptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/atol\" target=\"_blank\">atol</a> - convert a string to an integer</p>\n<p>The atol() and atoll() functions behave the same as atoi(), except that they convert the initial portion of the string to their return type of <em>long</em> or <em>long long</em>. atoq() is an obsolete name for atoll().\n  (<a href=\"https://reference.cs50.net/stdlib.h/atol\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "atoll(nptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/atoll\" target=\"_blank\">atoll</a> - convert a string to an integer</p>\n<p>The atol() and atoll() functions behave the same as atoi(), except that they convert the initial portion of the string to their return type of <em>long</em> or <em>long long</em>. atoq() is an obsolete name for atoll().\n  (<a href=\"https://reference.cs50.net/stdlib.h/atoll\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "bsearch(key, base, nmemb, size, compar);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/bsearch\" target=\"_blank\">bsearch</a> - binary search of a sorted array</p>\n<p>The bsearch() function searches an array of <code>nmemb</code> objects, the initial member of which is pointed to by <code>base</code>, for a member that matches the object pointed to by <code>key</code>. The size of each member of the array is specified by <code>size</code>. (<a href=\"https://reference.cs50.net/stdlib.h/bsearch\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "div(numerator, denominator);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/div\" target=\"_blank\">div</a> - compute quotient and remainder of an integer division</p>\n<p>The div() function computes the value <code>numerator</code>/<code>denominator</code> and returns the quotient and remainder in a structure named <code>div_t</code> that contains two integer members (in unspecified order) named <em>quot</em> and <em>rem</em>. The quotient is rounded toward zero. The result satisfies <em>quot</em>*<code>denominator</code>+<em>rem</em> = <code>numerator</code>. (<a href=\"https://reference.cs50.net/stdlib.h/div\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "exit(status);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/exit\" target=\"_blank\">exit</a> - cause normal process termination</p>\n<p>The exit() function causes normal process termination and the value of <em>status &amp; 0377</em> is returned to the parent (see wait(2)). (<a href=\"https://reference.cs50.net/stdlib.h/exit\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "getenv(name);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/getenv\" target=\"_blank\">getenv</a> - get an environment variable</p>\n<p>The getenv() function searches the environment list to find the environment variable <code>name</code>, and returns a pointer to the corresponding <em>value</em> string. (<a href=\"https://reference.cs50.net/stdlib.h/getenv\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "labs(j);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/labs\" target=\"_blank\">labs</a> - compute the absolute value of an integer</p>\n<p>The abs() function computes the absolute value of the integer argument <code>j</code>. The labs(), llabs() and imaxabs() functions compute the absolute value of the argument <code>j</code> of the appropriate integer type for the function.</p>\n"
            },
            {
              "block": "ldiv(numerator, denominator);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/ldiv\" target=\"_blank\">ldiv</a> - compute quotient and remainder of an integer division</p>\n<p>The ldiv(), lldiv(), and imaxdiv() functions do the same, dividing numbers of the indicated type and returning the result in a structure of the indicated name, in all cases with fields <em>quot</em> and <em>rem</em> of the same type as the function arguments.\n  (<a href=\"https://reference.cs50.net/stdlib.h/ldiv\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "llabs(j);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/llabs\" target=\"_blank\">llabs</a> - compute the absolute value of an integer</p>\n<p>The abs() function computes the absolute value of the integer argument <code>j</code>. The labs(), llabs() and imaxabs() functions compute the absolute value of the argument <code>j</code> of the appropriate integer type for the function.</p>\n"
            },
            {
              "block": "lldiv(numerator, denominator);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/lldiv\" target=\"_blank\">lldiv</a> - compute quotient and remainder of an integer division</p>\n<p>The ldiv(), lldiv(), and imaxdiv() functions do the same, dividing numbers of the indicated type and returning the result in a structure of the indicated name, in all cases with fields <em>quot</em> and <em>rem</em> of the same type as the function arguments.\n  (<a href=\"https://reference.cs50.net/stdlib.h/lldiv\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "mblen(s, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/mblen\" target=\"_blank\">mblen</a> - determine number of bytes in next multibyte character</p>\n<p>If <code>s</code> is not a NULL pointer, the mblen() function inspects at most <code>n</code> bytes of the multibyte string starting at <code>s</code> and extracts the next complete multibyte character. It uses a static anonymous shift state known only to the mblen() function. If the multibyte character is not the null wide character, it returns the number of bytes that were consumed from <code>s</code>. If the multibyte character is the null wide character, it returns 0. (<a href=\"https://reference.cs50.net/stdlib.h/mblen\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "mbstowcs(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/mbstowcs\" target=\"_blank\">mbstowcs</a> - convert a multibyte string to a wide-character string</p>\n<p>If <code>dest</code> is not a NULL pointer, the mbstowcs() function converts the multibyte string <code>src</code> to a wide-character string starting at <code>dest</code>. At most <code>n</code> wide characters are written to <code>dest</code>. The conversion starts in the initial state. The conversion can stop for three reasons: (<a href=\"https://reference.cs50.net/stdlib.h/mbstowcs\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "mbtowc(pwc, s, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/mbtowc\" target=\"_blank\">mbtowc</a> - convert a multibyte sequence to a wide character</p>\n<p>The main case for this function is when <code>s</code> is not NULL and <code>pwc</code> is not NULL. In this case, the mbtowc() function inspects at most <code>n</code> bytes of the multibyte string starting at <code>s</code>, extracts the next complete multibyte character, converts it to a wide character and stores it at <em>*pwc</em>. It updates an internal shift state known only to the mbtowc() function. If <code>s</code> does not point to a null byte (&#39;\\0&#39;), it returns the number of bytes that were consumed from <code>s</code>, otherwise it returns 0. (<a href=\"https://reference.cs50.net/stdlib.h/mbtowc\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "qsort(base, nmemb, size, compar);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/qsort\" target=\"_blank\">qsort</a> - sort an array</p>\n<p>The qsort() function sorts an array with <code>nmemb</code> elements of size <code>size</code>. The <code>base</code> argument points to the start of the array. (<a href=\"https://reference.cs50.net/stdlib.h/qsort\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtod(nptr, endptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtod\" target=\"_blank\">strtod</a> - convert ASCII string to floating-point number</p>\n<p>The strtod(), strtof(), and strtold() functions convert the initial portion of the string pointed to by <code>nptr</code> to <em>double</em>, <em>float</em>, and <em>long double</em> representation, respectively. (<a href=\"https://reference.cs50.net/stdlib.h/strtod\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtof(nptr, endptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtof\" target=\"_blank\">strtof</a> - convert ASCII string to floating-point number</p>\n<p>The strtod(), strtof(), and strtold() functions convert the initial portion of the string pointed to by <code>nptr</code> to <em>double</em>, <em>float</em>, and <em>long double</em> representation, respectively. (<a href=\"https://reference.cs50.net/stdlib.h/strtof\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtol(nptr, endptr, base);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtol\" target=\"_blank\">strtol</a> - convert a string to a long integer</p>\n<p>The strtol() function converts the initial part of the string in <code>nptr</code> to a long integer value according to the given <code>base</code>, which must be between 2 and 36 inclusive, or be the special value 0. (<a href=\"https://reference.cs50.net/stdlib.h/strtol\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtold(nptr, endptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtold\" target=\"_blank\">strtold</a> - convert ASCII string to floating-point number</p>\n<p>The strtod(), strtof(), and strtold() functions convert the initial portion of the string pointed to by <code>nptr</code> to <em>double</em>, <em>float</em>, and <em>long double</em> representation, respectively. (<a href=\"https://reference.cs50.net/stdlib.h/strtold\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtoll(nptr, endptr, base);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtoll\" target=\"_blank\">strtoll</a> - convert a string to a long integer</p>\n<p>The strtoll() function works just like the strtol() function but returns a long long integer value.\n  (<a href=\"https://reference.cs50.net/stdlib.h/strtoll\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtoul(nptr, endptr, base);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtoul\" target=\"_blank\">strtoul</a> - convert a string to an unsigned long integer</p>\n<p>The strtoul() function converts the initial part of the string in <code>nptr</code> to an <em>unsigned long int</em> value according to the given <code>base</code>, which must be between 2 and 36 inclusive, or be the special value 0. (<a href=\"https://reference.cs50.net/stdlib.h/strtoul\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtoull(nptr, endptr, base);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/strtoull\" target=\"_blank\">strtoull</a> - convert a string to an unsigned long integer</p>\n<p>The strtoull() function works just like the strtoul() function but returns an <em>unsigned long long int</em> value.\n  (<a href=\"https://reference.cs50.net/stdlib.h/strtoull\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "system(command);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/system\" target=\"_blank\">system</a> - execute a shell command</p>\n<p>system() executes a command specified in <code>command</code> by calling <code>/bin/sh -c</code> <code>command</code>, and returns after the command has been completed. During execution of the command, <code>SIGCHLD</code> will be blocked, and <code>SIGINT</code> and <code>SIGQUIT</code> will be ignored.</p>\n"
            },
            {
              "block": "wcstombs(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/wcstombs\" target=\"_blank\">wcstombs</a> - convert a wide-character string to a multibyte string</p>\n<p>If <code>dest</code> is not a NULL pointer, the wcstombs() function converts the wide-character string <code>src</code> to a multibyte string starting at <code>dest</code>. At most <code>n</code> bytes are written to <code>dest</code>. The conversion starts in the initial state. The conversion can stop for three reasons: (<a href=\"https://reference.cs50.net/stdlib.h/wcstombs\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "wctomb(s, wc);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdlib.h/wctomb\" target=\"_blank\">wctomb</a> - convert a wide character to a multibyte sequence</p>\n<p>If <code>s</code> is not NULL, the wctomb() function converts the wide character <code>wc</code> to its multibyte representation and stores it at the beginning of the character array pointed to by <code>s</code>. It updates the shift state, which is stored in a static anonymous variable known only to the wctomb() function, and returns the length of said multibyte representation, that is, the number of bytes written at <code>s</code>. (<a href=\"https://reference.cs50.net/stdlib.h/wctomb\" target=\"_blank\">read more</a>)</p>\n"
            }
          ]
        },
        {
          "name": "string.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <string.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>string.h</code>. You must put this\nin your program in order to use any of the <code>string.h</code> blocks.</p>\n"
            },
            {
              "block": "strlen(str);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strlen\" target=\"_blank\">strlen</a> - return length of a string</p>\n<p>Return the length of a string.</p>\n"
            },
            {
              "block": "strcpy(destination, source);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strcpy\" target=\"_blank\">strcpy</a> - copy a string</p>\n<p><code>strcpy</code> copys string <code>source</code> into string <code>destination</code>.</p>\n"
            },
            {
              "block": "strcmp(str1, str2);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strcmp\" target=\"_blank\">strcmp</a> - compare two strings</p>\n<p><code>strcmp</code> compares two strings: <code>str1</code> and <code>str2</code>.</p>\n"
            },
            {
              "block": "memchr(s, c, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/memchr\" target=\"_blank\">memchr</a> - scan memory for a character</p>\n<p>The memchr() function scans the initial <code>n</code> bytes of the memory area pointed to by <code>s</code> for the first instance of <code>c</code>. Both <code>c</code> and the bytes of the memory area pointed to by <code>s</code> are interpreted as <em>unsigned char</em>. (<a href=\"https://reference.cs50.net/string.h/memchr\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "memcmp(s1, s2, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/memcmp\" target=\"_blank\">memcmp</a> - compare memory areas</p>\n<p>The memcmp() function compares the first <code>n</code> bytes (each interpreted as <em>unsigned char</em>) of the memory areas <code>s1</code> and <code>s2</code>.</p>\n"
            },
            {
              "block": "memcpy(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/memcpy\" target=\"_blank\">memcpy</a> - copy memory area</p>\n<p>The memcpy() function copies <code>n</code> bytes from memory area <code>src</code> to memory area <code>dest</code>. The memory areas must not overlap. Use memmove(3) if the memory areas do overlap.</p>\n"
            },
            {
              "block": "memmove(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/memmove\" target=\"_blank\">memmove</a> - copy memory area</p>\n<p>The memmove() function copies <code>n</code> bytes from memory area <code>src</code> to memory area <code>dest</code>. The memory areas may overlap: copying takes place as though the bytes in <code>src</code> are first copied into a temporary array that does not overlap <code>src</code> or <code>dest</code>, and the bytes are then copied from the temporary array to <code>dest</code>.</p>\n"
            },
            {
              "block": "memset(s, c, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/memset\" target=\"_blank\">memset</a> - fill memory with a constant byte</p>\n<p>The memset() function fills the first <code>n</code> bytes of the memory area pointed to by <code>s</code> with the constant byte <code>c</code>.</p>\n"
            },
            {
              "block": "strcat(dest, src);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strcat\" target=\"_blank\">strcat</a> - concatenate two strings</p>\n<p>The strcat() function appends the <code>src</code> string to the <code>dest</code> string, overwriting the terminating null byte (&#39;\\0&#39;) at the end of <code>dest</code>, and then adds a terminating null byte. The strings may not overlap, and the <code>dest</code> string must have enough space for the result. If <code>dest</code> is not large enough, program behavior is unpredictable; <em>buffer overruns are a favorite avenue for attacking secure programs</em>. (<a href=\"https://reference.cs50.net/string.h/strcat\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strchr(s, c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strchr\" target=\"_blank\">strchr</a> - locate character in string</p>\n<p>The strchr() function returns a pointer to the first occurrence of the character <code>c</code> in the string <code>s</code>. (<a href=\"https://reference.cs50.net/string.h/strchr\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strcoll(s1, s2);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strcoll\" target=\"_blank\">strcoll</a> - compare two strings using the current locale</p>\n<p>The strcoll() function compares the two strings <code>s1</code> and <code>s2</code>. It returns an integer less than, equal to, or greater than zero if <code>s1</code> is found, respectively, to be less than, to match, or be greater than <code>s2</code>. The comparison is based on strings interpreted as appropriate for the program&#39;s current locale for category *LC_COLLATE*.  (See setlocale(3).)</p>\n"
            },
            {
              "block": "strcspn(s, reject);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strcspn\" target=\"_blank\">strcspn</a> - search a string for a set of bytes</p>\n<p>The strcspn() function calculates the length of the initial segment of <code>s</code> which consists entirely of bytes not in <code>reject</code>.\n  (<a href=\"https://reference.cs50.net/string.h/strcspn\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strerror(errnum);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strerror\" target=\"_blank\">strerror</a> - return string describing error number</p>\n<p>The strerror() function returns a pointer to a string that describes the error code passed in the argument <code>errnum</code>, possibly using the <code>LC_MESSAGES</code> part of the current locale to select the appropriate language. (For example, if <code>errnum</code> is <code>EINVAL</code>, the returned description will &quot;Invalid argument&quot;.) This string must not be modified by the application, but may be modified by a subsequent call to strerror(). No library function, including perror(3), will modify this string. (<a href=\"https://reference.cs50.net/string.h/strerror\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strncat(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strncat\" target=\"_blank\">strncat</a> - concatenate two strings</p>\n<p>The strncat() function is similar, except that (<a href=\"https://reference.cs50.net/string.h/strncat\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strncmp(s1, s2, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strncmp\" target=\"_blank\">strncmp</a> - compare two strings</p>\n<p>The strncmp() function is similar, except it compares the only first (at most) <code>n</code> bytes of <code>s1</code> and <code>s2</code>.\n  (<a href=\"https://reference.cs50.net/string.h/strncmp\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strncpy(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strncpy\" target=\"_blank\">strncpy</a> - copy a string</p>\n<p>The strncpy() function is similar, except that at most <code>n</code> bytes of <code>src</code> are copied. *Warning*: If there is no null byte among the first <code>n</code> bytes of <code>src</code>, the string placed in <code>dest</code> will not be null-terminated. (<a href=\"https://reference.cs50.net/string.h/strncpy\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strpbrk(s, accept);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strpbrk\" target=\"_blank\">strpbrk</a> - search a string for any of a set of bytes</p>\n<p>The strpbrk() function locates the first occurrence in the string <code>s</code> of any of the bytes in the string <code>accept</code>.</p>\n"
            },
            {
              "block": "strrchr(s, c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strrchr\" target=\"_blank\">strrchr</a> - locate character in string</p>\n<p>The strrchr() function returns a pointer to the last occurrence of the character <code>c</code> in the string <code>s</code>. (<a href=\"https://reference.cs50.net/string.h/strrchr\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strspn(s, accept);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strspn\" target=\"_blank\">strspn</a> - search a string for a set of bytes</p>\n<p>The strspn() function calculates the length (in bytes) of the initial segment of <code>s</code> which consists entirely of bytes in <code>accept</code>. (<a href=\"https://reference.cs50.net/string.h/strspn\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strstr(haystack, needle);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strstr\" target=\"_blank\">strstr</a> - locate a substring</p>\n<p>The strstr() function finds the first occurrence of the substring <code>needle</code> in the string <code>haystack</code>. The terminating null bytes (&#39;\\0&#39;) are not compared. (<a href=\"https://reference.cs50.net/string.h/strstr\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strtok(str, delim);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strtok\" target=\"_blank\">strtok</a> - extract tokens from strings</p>\n<p>The strtok() function parses a string into a sequence of tokens. On the first call to strtok() the string to be parsed should be specified in <code>str</code>. In each subsequent call that should parse the same string, <code>str</code> should be NULL. (<a href=\"https://reference.cs50.net/string.h/strtok\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strxfrm(dest, src, n);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/string.h/strxfrm\" target=\"_blank\">strxfrm</a> - string transformation</p>\n<p>The strxfrm() function transforms the <code>src</code> string into a form such that the result of strcmp(3) on two strings that have been transformed with strxfrm() is the same as the result of strcoll(3) on the two strings before their transformation. The first <code>n</code> bytes of the transformed string are placed in <code>dest</code>. The transformation is based on the program&#39;s current locale for category *LC_COLLATE*.  (See setlocale(3)).</p>\n"
            }
          ]
        },
        {
          "name": "math.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <math.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>math.h</code>. You must put this\nin your program in order to use any of the <code>math.h</code> blocks.</p>\n"
            },
            {
              "block": "round(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/round\" target=\"_blank\">round</a> - rounds value</p>\n<p>Rounds the <code>double</code> <code>x</code> to the nearest integer value.</p>\n"
            },
            {
              "block": "floor(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/floor\" target=\"_blank\">floor</a> - rounds down value</p>\n<p>Rounds <code>x</code> down.</p>\n"
            },
            {
              "block": "ceil(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/ceil\" target=\"_blank\">ceil</a> - rounds up value</p>\n<p>Rounds <code>x</code> upward.</p>\n"
            },
            {
              "block": "acos(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/acos\" target=\"_blank\">acos</a> - arc cosine function</p>\n<p>The acos() function calculates the arc cosine of <code>x</code>; that is the value whose cosine is <code>x</code>.</p>\n"
            },
            {
              "block": "acosh(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/acosh\" target=\"_blank\">acosh</a> - inverse hyperbolic cosine function</p>\n<p>The acosh() function calculates the inverse hyperbolic cosine of <code>x</code>; that is the value whose hyperbolic cosine is <code>x</code>.</p>\n"
            },
            {
              "block": "asin(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/asin\" target=\"_blank\">asin</a> - arc sine function</p>\n<p>The asin() function calculates the principal value of the arc sine of <code>x</code>; that is the value whose sine is <code>x</code>.</p>\n"
            },
            {
              "block": "asinh(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/asinh\" target=\"_blank\">asinh</a> - inverse hyperbolic sine function</p>\n<p>The asinh() function calculates the inverse hyperbolic sine of <code>x</code>; that is the value whose hyperbolic sine is <code>x</code>.</p>\n"
            },
            {
              "block": "atan(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/atan\" target=\"_blank\">atan</a> - arc tangent function</p>\n<p>The atan() function calculates the principal value of the arc tangent of <code>x</code>; that is the value whose tangent is <code>x</code>.</p>\n"
            },
            {
              "block": "atan2(y, x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/atan2\" target=\"_blank\">atan2</a> - arc tangent function of two variables</p>\n<p>The atan2() function calculates the principal value of the arc tangent of <em>y/x</em>, using the signs of the two arguments to determine the quadrant of the result.</p>\n"
            },
            {
              "block": "atanh(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/atanh\" target=\"_blank\">atanh</a> - inverse hyperbolic tangent function</p>\n<p>The atanh() function calculates the inverse hyperbolic tangent of <code>x</code>; that is the value whose hyperbolic tangent is <code>x</code>.</p>\n"
            },
            {
              "block": "copysign(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/copysign\" target=\"_blank\">copysign</a> - copy sign of a number</p>\n<p>The copysign() functions return a value whose absolute value matches that of <code>x</code>, but whose sign bit matches that of <code>y</code>. (<a href=\"https://reference.cs50.net/math.h/copysign\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "cos(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/cos\" target=\"_blank\">cos</a> - cosine function</p>\n<p>The cos() function returns the cosine of <code>x</code>, where <code>x</code> is given in radians.</p>\n"
            },
            {
              "block": "cosh(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/cosh\" target=\"_blank\">cosh</a> - hyperbolic cosine function</p>\n<p>The cosh() function returns the hyperbolic cosine of <code>x</code>, which is defined mathematically as:\n       cosh(x) = (exp(x) + exp(-x)) / 2   </p>\n"
            },
            {
              "block": "erf(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/erf\" target=\"_blank\">erf</a> - error function</p>\n<p>The erf() function returns the error function of <code>x</code>, defined as (<a href=\"https://reference.cs50.net/math.h/erf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "erfc(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/erfc\" target=\"_blank\">erfc</a> - complementary error function</p>\n<p>The erfc() function returns the complementary error function of <code>x</code>, that is, 1.0 - erf(x).</p>\n"
            },
            {
              "block": "exp(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/exp\" target=\"_blank\">exp</a> - base-e exponential function</p>\n<p>The exp() function returns the value of e (the base of natural logarithms) raised to the power of <code>x</code>.</p>\n"
            },
            {
              "block": "exp2(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/exp2\" target=\"_blank\">exp2</a> - base-2 exponential function</p>\n<p>The exp2() function returns the value of 2 raised to the power of <code>x</code>.</p>\n"
            },
            {
              "block": "expm1(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/expm1\" target=\"_blank\">expm1</a> - exponential minus 1</p>\n<p><em>expm1(x)</em> returns a value equivalent to\n       exp(x) - 1<br>It is computed in a way that is accurate even if the value of <code>x</code> is near zero—a case where <em>exp(x) - 1</em> would be inaccurate due to subtraction of two numbers that are nearly equal.</p>\n"
            },
            {
              "block": "fabs(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fabs\" target=\"_blank\">fabs</a> - absolute value of floating-point number</p>\n<p>The fabs() functions return the absolute value of the floating-point number <code>x</code>.</p>\n"
            },
            {
              "block": "fdim(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fdim\" target=\"_blank\">fdim</a> - positive difference</p>\n<p>These functions return the positive difference, max(<code>x</code>-<code>y</code>,0), between their arguments.</p>\n"
            },
            {
              "block": "fma(x, y, z);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fma\" target=\"_blank\">fma</a> - floating-point multiply and add</p>\n<p>The fma() function computes <code>x</code> * <code>y</code> + <code>z</code>. The result is rounded as one ternary operation according to the current rounding mode (see fenv(3)).</p>\n"
            },
            {
              "block": "fmax(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fmax\" target=\"_blank\">fmax</a> - determine maximum of two floating-point numbers</p>\n<p>These functions return the larger value of <code>x</code> and <code>y</code>.</p>\n"
            },
            {
              "block": "fmin(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fmin\" target=\"_blank\">fmin</a> - determine minimum of two floating-point numbers</p>\n<p>These functions the lesser value of <code>x</code> and <code>y</code>.</p>\n"
            },
            {
              "block": "fmod(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fmod\" target=\"_blank\">fmod</a> - floating-point remainder function</p>\n<p>The fmod() function computes the floating-point remainder of dividing <code>x</code> by <code>y</code>. The return value is <code>x</code> - <em>n</em> * <code>y</code>, where <em>n</em> is the quotient of <code>x</code> / <code>y</code>, rounded toward zero to an integer.</p>\n"
            },
            {
              "block": "fpclassify(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/fpclassify\" target=\"_blank\">fpclassify</a> - floating-point classification macros</p>\n<p>Floating point numbers can have special values, such as infinite or NaN. With the macro *fpclassify(*<em>x</em>*)* you can find out what type <em>x</em> is. The macro takes any floating-point expression as argument. The result is one of the following values: (<a href=\"https://reference.cs50.net/math.h/fpclassify\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "frexp(x, exp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/frexp\" target=\"_blank\">frexp</a> - convert floating-point number to fractional and integral components</p>\n<p>The frexp() function is used to split the number <code>x</code> into a normalized fraction and an exponent which is stored in <code>exp</code>.</p>\n"
            },
            {
              "block": "ilogb(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/ilogb\" target=\"_blank\">ilogb</a> - get integer exponent of a floating-point value</p>\n<p>These functions return the exponent part of their argument as a signed integer. When no error occurs, these functions are equivalent to the corresponding logb(3) functions, cast to <em>int</em>.</p>\n"
            },
            {
              "block": "isfinite(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isfinite\" target=\"_blank\">isfinite</a> - floating-point classification macros</p>\n<p><code>\\*isfinite(\\*_x_\\*)\\*</code><br>returns a nonzero value if  (fpclassify(x) != FP_NAN &amp;&amp; fpclassify(x) != FP_INFINITE) (<a href=\"https://reference.cs50.net/math.h/isfinite\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isgreater(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isgreater\" target=\"_blank\">isgreater</a> - floating-point relational tests without exception for NaN</p>\n<p><code>isgreater()</code><br>determines <em>(x) &gt; (y)</em> without an exception if <em>x</em> or <em>y</em> is NaN. (<a href=\"https://reference.cs50.net/math.h/isgreater\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isgreaterequal(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isgreaterequal\" target=\"_blank\">isgreaterequal</a> - floating-point relational tests without exception for NaN</p>\n<p><code>isgreaterequal()</code><br>determines <em>(x) &gt;= (y)</em> without an exception if <em>x</em> or <em>y</em> is NaN. (<a href=\"https://reference.cs50.net/math.h/isgreaterequal\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isinf(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isinf\" target=\"_blank\">isinf</a> - floating-point classification macros</p>\n<p><code>\\*isinf(\\*_x_\\*)\\*</code><br>returns 1 if <em>x</em> is positive infinity, and -1 if <em>x</em> is negative infinity.\n         (<a href=\"https://reference.cs50.net/math.h/isinf\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isless(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isless\" target=\"_blank\">isless</a> - floating-point relational tests without exception for NaN</p>\n<p><code>isless()</code><br>determines <em>(x) &lt; (y)</em> without an exception if <em>x</em> or <em>y</em> is NaN. (<a href=\"https://reference.cs50.net/math.h/isless\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "islessequal(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/islessequal\" target=\"_blank\">islessequal</a> - floating-point relational tests without exception for NaN</p>\n<p><code>islessequal()</code><br>determines <em>(x) &lt;= (y)</em> without an exception if <em>x</em> or <em>y</em> is NaN. (<a href=\"https://reference.cs50.net/math.h/islessequal\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "islessgreater(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/islessgreater\" target=\"_blank\">islessgreater</a> - floating-point relational tests without exception for NaN</p>\n<p><code>islessgreater()</code><br>determines <em>(x) &lt; (y) || (x) &gt; (y)</em> without an exception if <em>x</em> or <em>y</em> is NaN. This macro is not equivalent to <em>x != y</em> because that expression is true if <em>x</em> or <em>y</em> is NaN. (<a href=\"https://reference.cs50.net/math.h/islessgreater\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isnan(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isnan\" target=\"_blank\">isnan</a> - floating-point classification macros</p>\n<p><code>\\*isnan(\\*_x_\\*)\\*</code><br>returns a nonzero value if (fpclassify(x) == FP_NAN) (<a href=\"https://reference.cs50.net/math.h/isnan\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isnormal(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isnormal\" target=\"_blank\">isnormal</a> - floating-point classification macros</p>\n<p><code>\\*isnormal(\\*_x_\\*)\\*</code><br>returns a nonzero value if (fpclassify(x) == FP_NORMAL) (<a href=\"https://reference.cs50.net/math.h/isnormal\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isunordered(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/isunordered\" target=\"_blank\">isunordered</a> - floating-point relational tests without exception for NaN</p>\n<p><code>isunordered()</code><br>determines whether its arguments are unordered, that is, whether at least one of the arguments is a NaN.\n         (<a href=\"https://reference.cs50.net/math.h/isunordered\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "ldexp(x, exp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/ldexp\" target=\"_blank\">ldexp</a> - multiply floating-point number by integral power of 2</p>\n<p>The ldexp() function returns the result of multiplying the floating-point number <code>x</code> by 2 raised to the power <code>exp</code>.</p>\n"
            },
            {
              "block": "llrint(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/llrint\" target=\"_blank\">llrint</a> - round to nearest integer</p>\n<p>These functions round their argument to the nearest integer value, using the current rounding direction (see fesetround(3)). (<a href=\"https://reference.cs50.net/math.h/llrint\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "llround(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/llround\" target=\"_blank\">llround</a> - round to nearest integer, away from zero</p>\n<p>These functions round their argument to the nearest integer value, rounding away from zero, regardless of the current rounding direction (see fenv(3)). (<a href=\"https://reference.cs50.net/math.h/llround\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "log(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/log\" target=\"_blank\">log</a> - natural logarithmic function</p>\n<p>The log() function returns the natural logarithm of <code>x</code>.</p>\n"
            },
            {
              "block": "log10(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/log10\" target=\"_blank\">log10</a> -  base-10 logarithmic function</p>\n<p>The log10() function returns the base 10 logarithm of <code>x</code>.</p>\n"
            },
            {
              "block": "log1p(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/log1p\" target=\"_blank\">log1p</a> -  logarithm of 1 plus argument</p>\n<p><em>log1p(x)</em> returns a value equivalent to\n       log (1 + <code>x</code>)<br>It is computed in a way that is accurate even if the value of <code>x</code> is near zero.</p>\n"
            },
            {
              "block": "log2(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/log2\" target=\"_blank\">log2</a> - base-2 logarithmic function</p>\n<p>The log2() function returns the base 2 logarithm of <code>x</code>.</p>\n"
            },
            {
              "block": "logb(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/logb\" target=\"_blank\">logb</a> - get exponent of a floating-point value</p>\n<p>These functions extract the exponent from the internal floating-point representation of <code>x</code> and return it as a floating-point value. The integer constant *FLT<em>RADIX*, defined in </em><float.h>_, indicates the radix used for the system&#39;s floating-point representation. If *FLT_RADIX* is 2, *logb(*<code>x</code>*)* is equal to *floor(log2(*<code>x</code>*))*, except that it is probably faster. (<a href=\"https://reference.cs50.net/math.h/logb\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "lrint(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/lrint\" target=\"_blank\">lrint</a> - round to nearest integer</p>\n<p>These functions round their argument to the nearest integer value, using the current rounding direction (see fesetround(3)). (<a href=\"https://reference.cs50.net/math.h/lrint\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "lround(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/lround\" target=\"_blank\">lround</a> - round to nearest integer, away from zero</p>\n<p>These functions round their argument to the nearest integer value, rounding away from zero, regardless of the current rounding direction (see fenv(3)). (<a href=\"https://reference.cs50.net/math.h/lround\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "modf(x, iptr);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/modf\" target=\"_blank\">modf</a> - extract signed integral and fractional values from floating-point number</p>\n<p>The modf() function breaks the argument <code>x</code> into an integral part and a fractional part, each of which has the same sign as <code>x</code>. The integral part is stored in the location pointed to by <code>iptr</code>.</p>\n"
            },
            {
              "block": "nearbyint(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/nearbyint\" target=\"_blank\">nearbyint</a> - round to nearest integer</p>\n<p>The nearbyint() functions round their argument to an integer value in floating-point format, using the current rounding direction (see fesetround(3)) and without raising the <em>inexact</em> exception. (<a href=\"https://reference.cs50.net/math.h/nearbyint\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "pow(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/pow\" target=\"_blank\">pow</a> - power functions</p>\n<p>The pow() function returns the value of <code>x</code> raised to the power of <code>y</code>.</p>\n"
            },
            {
              "block": "remainder(x, y);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/remainder\" target=\"_blank\">remainder</a> - floating-point remainder function</p>\n<p>The remainder() function computes the remainder of dividing <code>x</code> by <code>y</code>. The return value is <code>x</code>-<em>n</em>*<code>y</code>, where <em>n</em> is the value <em>x / y</em>, rounded to the nearest integer. If the absolute value of <code>x</code>-<em>n</em>*<code>y</code> is 0.5, <em>n</em> is chosen to be even. (<a href=\"https://reference.cs50.net/math.h/remainder\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "remquo(x, y, quo);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/remquo\" target=\"_blank\">remquo</a> - remainder and part of quotient</p>\n<p>For example, <em>remquo(29.0, 3.0)</em> returns -1.0 and might store 2. Note that the actual quotient might not fit in an integer.\n     (<a href=\"https://reference.cs50.net/math.h/remquo\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "rint(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/rint\" target=\"_blank\">rint</a> - round to nearest integer</p>\n<p>The rint() functions do the same, but will raise the <em>inexact</em> exception (*FE_INEXACT*, checkable via fetestexcept(3)) when the result differs in value from the argument.\n  (<a href=\"https://reference.cs50.net/math.h/rint\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "scalbln(x, exp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/scalbln\" target=\"_blank\">scalbln</a> - multiply floating-point number by integral power of radix</p>\n<p>These functions multiply their first argument <code>x</code> by *FLT_RADIX* (probably 2) to the power of <code>exp</code>, that is:\n       x * FLT_RADIX ** exp<br>The definition of *FLT<em>RADIX* can be obtained by including </em><float.h>_.</p>\n"
            },
            {
              "block": "scalbn(x, exp);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/scalbn\" target=\"_blank\">scalbn</a> - multiply floating-point number by integral power of radix</p>\n<p>These functions multiply their first argument <code>x</code> by *FLT_RADIX* (probably 2) to the power of <code>exp</code>, that is:\n       x * FLT_RADIX ** exp<br>The definition of *FLT<em>RADIX* can be obtained by including </em><float.h>_.</p>\n"
            },
            {
              "block": "signbit(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/signbit\" target=\"_blank\">signbit</a> - test sign of a real floating-point number</p>\n<p>signbit() is a generic macro which can work on all real floating-point types. It returns a nonzero value if the value of <em>x</em> has its sign bit set. (<a href=\"https://reference.cs50.net/math.h/signbit\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "sin(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/sin\" target=\"_blank\">sin</a> - sine function</p>\n<p>The sin() function returns the sine of <code>x</code>, where <code>x</code> is given in radians.</p>\n"
            },
            {
              "block": "sinh(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/sinh\" target=\"_blank\">sinh</a> - hyperbolic sine function</p>\n<p>The sinh() function returns the hyperbolic sine of <code>x</code>, which is defined mathematically as:\n       sinh(x) = (exp(x) - exp(-x)) / 2   </p>\n"
            },
            {
              "block": "sqrt(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/sqrt\" target=\"_blank\">sqrt</a> - square root function</p>\n<p>The sqrt() function returns the nonnegative square root of <code>x</code>.</p>\n"
            },
            {
              "block": "tan(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/tan\" target=\"_blank\">tan</a> - tangent function</p>\n<p>The tan() function returns the tangent of <code>x</code>, where <code>x</code> is given in radians.</p>\n"
            },
            {
              "block": "tgamma(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/tgamma\" target=\"_blank\">tgamma</a> - true gamma function</p>\n<p>The Gamma function is defined by (<a href=\"https://reference.cs50.net/math.h/tgamma\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "trunc(x);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/math.h/trunc\" target=\"_blank\">trunc</a> - round to integer, toward zero</p>\n<p>These functions round <code>x</code> to the nearest integer not larger in absolute value.</p>\n"
            }
          ]
        },
        {
          "name": "time.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <time.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>time.h</code>. You must put this\nin your program in order to use any of the <code>time.h</code> blocks.</p>\n"
            },
            {
              "block": "asctime(tm);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/asctime\" target=\"_blank\">asctime</a> - transform date and time to broken-down time or ASCII</p>\n<p>The asctime() and mktime() functions both take an argument representing broken-down time which is a representation separated into year, month, day, and so on. (<a href=\"https://reference.cs50.net/time.h/asctime\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "clock();",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/clock\" target=\"_blank\">clock</a> - determine processor time</p>\n<p>The clock() function returns an approximation of processor time used by the program.</p>\n"
            },
            {
              "block": "ctime(timep);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/ctime\" target=\"_blank\">ctime</a> - transform date and time to broken-down time or ASCII</p>\n<p>The ctime(), *gmtime*() and *localtime*() functions all take an argument of data type <code>time_t</code> which represents calendar time. When interpreted as an absolute time value, it represents the number of seconds elapsed since the Epoch, 1970-01-01 00:00:00 +0000 (UTC). (<a href=\"https://reference.cs50.net/time.h/ctime\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "difftime(time1, time0);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/difftime\" target=\"_blank\">difftime</a> - calculate time difference</p>\n<p>The difftime() function returns the number of seconds elapsed between time <code>time1</code> and time <code>time0</code>, represented as a <em>double</em>. Each of the times is specified in calendar time, which means its value is a measurement (in seconds) relative to the Epoch, 1970-01-01 00:00:00 +0000 (UTC).</p>\n"
            },
            {
              "block": "mktime(tm);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/mktime\" target=\"_blank\">mktime</a> - transform date and time to broken-down time or ASCII</p>\n<p>The asctime() and mktime() functions both take an argument representing broken-down time which is a representation separated into year, month, day, and so on. (<a href=\"https://reference.cs50.net/time.h/mktime\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "strftime(s, max, format, tm);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/strftime\" target=\"_blank\">strftime</a> - format date and time</p>\n<p>The strftime() function formats the broken-down time <code>tm</code> according to the format specification <code>format</code> and places the result in the character array <code>s</code> of size <code>max</code>. (<a href=\"https://reference.cs50.net/time.h/strftime\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "time(tloc);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/time.h/time\" target=\"_blank\">time</a> - get time</p>\n<p>The time() function shall return the value of time  in seconds since the Epoch. (<a href=\"https://reference.cs50.net/time.h/time\" target=\"_blank\">read more</a>)</p>\n"
            }
          ]
        },
        {
          "name": "ctype.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <ctype.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>ctype.h</code>. You must put this\nin your program in order to use any of the <code>ctype.h</code> blocks.</p>\n"
            },
            {
              "block": "toupper(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/toupper\" target=\"_blank\">toupper</a> - converts letter to uppercase</p>\n<p>Converts a lowercase letter to uppercase.</p>\n"
            },
            {
              "block": "tolower(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/tolower\" target=\"_blank\">tolower</a> - converts letter to lowercase</p>\n<p>Converts an uppercase letter to lowercase.</p>\n"
            },
            {
              "block": "isxdigit(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isxdigit\" target=\"_blank\">isxdigit</a> - checks if character is hexadecimal</p>\n<p>Checks if the given character is a hexadecimal digit. (<a href=\"https://reference.cs50.net/ctype.h/isxdigit\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isupper(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isupper\" target=\"_blank\">isupper</a> - checks if character is uppercase</p>\n<p>Checks if the given character is an uppercase alphabetic letter.</p>\n"
            },
            {
              "block": "isspace(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isspace\" target=\"_blank\">isspace</a> - checks if character is a white-space</p>\n<p>Checks if the given character is a white-space character. C considers white-space characters to be <code>&#39; &#39;</code>,<code>&#39;\\n&#39;</code>,<code>\\t</code>,<code>&#39;\\v&#39;</code>,<code>\\f</code>,<code>&#39;\\r&#39;</code>.</p>\n"
            },
            {
              "block": "ispunct(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/ispunct\" target=\"_blank\">ispunct</a> - checks if character is a punctuation mark</p>\n<p>Checks if the given character is a punctuation character. C considers every graphic character (see <code>isgraph()</code>) that is not alphanumeric to be a punctuation.</p>\n"
            },
            {
              "block": "isprint(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isprint\" target=\"_blank\">isprint</a> - checks if character is printable</p>\n<p>Checks if the given character is a printable character. A printable character is a character that is displayed on the screen when printed. This is the opposite of a control character (see <code>iscntrl()</code>). (<a href=\"https://reference.cs50.net/ctype.h/isprint\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "islower(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/islower\" target=\"_blank\">islower</a> - checks if character is lowercase</p>\n<p>Checks if the given character is a lowercase alphabetic letter.</p>\n"
            },
            {
              "block": "isgraph(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isgraph\" target=\"_blank\">isgraph</a> - checks if character is graphical</p>\n<p>Checks if the given character has a graphical representation. The characters with graphical representation are all those given by <code>isprint()</code> except the space character <code>&#39; &#39;</code>.</p>\n"
            },
            {
              "block": "isdigit(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isdigit\" target=\"_blank\">isdigit</a> - checks if character is a digit</p>\n<p>Checks if the given character is a numeric digit. Note that, per the ASCII table, the character <code>&#39;5&#39;</code> and the integer <code>5</code> are different and only the first one constitutes a numeric digit. </p>\n"
            },
            {
              "block": "iscntrl(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/iscntrl\" target=\"_blank\">iscntrl</a> - checks if character is control</p>\n<p>Checks if the given character is a control character. A control character is a character that is not displayed on the screen when printed. This is the opposite of a printable character (see <code>isprint()</code>). (<a href=\"https://reference.cs50.net/ctype.h/iscntrl\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "isblank(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isblank\" target=\"_blank\">isblank</a> - checks if character is blank</p>\n<p>Checks if the given character is blank, which means either a space <code>&#39; &#39;</code> or a tab <code>&#39;\\t&#39;</code>.</p>\n"
            },
            {
              "block": "isalpha(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isalpha\" target=\"_blank\">isalpha</a> - checks if character is an alphabetic letter.</p>\n<p>Checks if the given character is an alphabetic letter.</p>\n"
            },
            {
              "block": "isalnum(c);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/ctype.h/isalnum\" target=\"_blank\">isalnum</a> - checks if character is alphanumeric</p>\n<p>Checks if the given character is alphanumeric.</p>\n"
            }
          ]
        },
        {
          "name": "stdarg.h",
          "color": "blue",
          "blocks": [
            {
              "block": "#include <stdarg.h>",
              "context": "compilationUnit",
              "title": "<p>Includes the header file for <code>stdarg.h</code>. You must put this\nin your program in order to use any of the <code>stdarg.h</code> blocks.</p>\n"
            },
            {
              "block": "va_arg(ap, type);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdarg.h/va_arg\" target=\"_blank\">va_arg</a> - variable argument lists</p>\n<p>The called function must declare an object of type _va<em>list</em> which is used by the macros va_start(), va_arg(), and va_end(). (<a href=\"https://reference.cs50.net/stdarg.h/va_arg\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "va_copy(dest, src);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdarg.h/va_copy\" target=\"_blank\">va_copy</a> - variable argument lists</p>\n<p>The va_copy() macro copies the (previously initialized) variable argument list <code>src</code> to <code>dest</code>. The behavior is as if va_start() were applied to <code>dest</code> with the same <em>last</em> argument, followed by the same number of va_arg() invocations that was used to reach the current state of <code>src</code>. (<a href=\"https://reference.cs50.net/stdarg.h/va_copy\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "va_end(ap);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdarg.h/va_end\" target=\"_blank\">va_end</a> - variable argument lists</p>\n<p>The called function must declare an object of type _va<em>list</em> which is used by the macros va_start(), va_arg(), and va_end(). (<a href=\"https://reference.cs50.net/stdarg.h/va_end\" target=\"_blank\">read more</a>)</p>\n"
            },
            {
              "block": "va_start(ap, last);",
              "context": "blockItem",
              "title": "<p><a href=\"https://reference.cs50.net/stdarg.h/va_start\" target=\"_blank\">va_start</a> - variable argument lists</p>\n<p>The called function must declare an object of type _va<em>list</em> which is used by the macros va_start(), va_arg(), and va_end(). (<a href=\"https://reference.cs50.net/stdarg.h/va_start\" target=\"_blank\">read more</a>)</p>\n"
            }
          ]
        }
      ],
      "modeOptions": {
        "functions": {
          "GetChar": {
            "color": "blue",
            "shape": "block-only"
          },
          "GetDouble": {
            "color": "blue",
            "shape": "block-only"
          },
          "GetFloat": {
            "color": "blue",
            "shape": "block-only"
          },
          "GetInt": {
            "color": "blue",
            "shape": "block-only"
          },
          "GetLongLong": {
            "color": "blue",
            "shape": "block-only"
          },
          "GetString": {
            "color": "blue",
            "shape": "block-only"
          },
          "clearerr": {
            "color": "blue",
            "shape": "block-only"
          },
          "fclose": {
            "color": "blue",
            "shape": "block-only"
          },
          "feof": {
            "color": "blue",
            "shape": "block-only"
          },
          "ferror": {
            "color": "blue",
            "shape": "block-only"
          },
          "fflush": {
            "color": "blue",
            "shape": "block-only"
          },
          "fgetc": {
            "color": "blue",
            "shape": "block-only"
          },
          "fgetpos": {
            "color": "blue",
            "shape": "block-only"
          },
          "fgets": {
            "color": "blue",
            "shape": "block-only"
          },
          "fopen": {
            "color": "blue",
            "shape": "block-only"
          },
          "fprintf": {
            "color": "blue",
            "shape": "block-only"
          },
          "fputc": {
            "color": "blue",
            "shape": "block-only"
          },
          "fputs": {
            "color": "blue",
            "shape": "block-only"
          },
          "fread": {
            "color": "blue",
            "shape": "block-only"
          },
          "fscanf": {
            "color": "blue",
            "shape": "block-only"
          },
          "fseek": {
            "color": "blue",
            "shape": "block-only"
          },
          "fsetpos": {
            "color": "blue",
            "shape": "block-only"
          },
          "ftell": {
            "color": "blue",
            "shape": "block-only"
          },
          "fwrite": {
            "color": "blue",
            "shape": "block-only"
          },
          "getc": {
            "color": "blue",
            "shape": "block-only"
          },
          "getchar": {
            "color": "blue",
            "shape": "block-only"
          },
          "gets": {
            "color": "blue",
            "shape": "block-only"
          },
          "perror": {
            "color": "blue",
            "shape": "block-only"
          },
          "printf": {
            "color": "blue",
            "shape": "block-only"
          },
          "putc": {
            "color": "blue",
            "shape": "block-only"
          },
          "putchar": {
            "color": "blue",
            "shape": "block-only"
          },
          "puts": {
            "color": "blue",
            "shape": "block-only"
          },
          "remove": {
            "color": "blue",
            "shape": "block-only"
          },
          "rewind": {
            "color": "blue",
            "shape": "block-only"
          },
          "scanf": {
            "color": "blue",
            "shape": "block-only"
          },
          "setbuf": {
            "color": "blue",
            "shape": "block-only"
          },
          "setvbuf": {
            "color": "blue",
            "shape": "block-only"
          },
          "snprintf": {
            "color": "blue",
            "shape": "block-only",
            "minArgs": 3
          },
          "sprintf": {
            "color": "blue",
            "shape": "block-only"
          },
          "sscanf": {
            "color": "blue",
            "shape": "block-only",
            "minArgs": 2
          },
          "ungetc": {
            "color": "blue",
            "shape": "block-only"
          },
          "vfprintf": {
            "color": "blue",
            "shape": "block-only"
          },
          "vfscanf": {
            "color": "blue",
            "shape": "block-only"
          },
          "vprintf": {
            "color": "blue",
            "shape": "block-only"
          },
          "vscanf": {
            "color": "blue",
            "shape": "block-only"
          },
          "vsnprintf": {
            "color": "blue",
            "shape": "block-only"
          },
          "vsprintf": {
            "color": "blue",
            "shape": "block-only"
          },
          "vsscanf": {
            "color": "blue",
            "shape": "block-only"
          },
          "abort": {
            "color": "blue",
            "shape": "block-only"
          },
          "abs": {
            "color": "blue",
            "shape": "block-only"
          },
          "atexit": {
            "color": "blue",
            "shape": "block-only"
          },
          "atof": {
            "color": "blue",
            "shape": "block-only"
          },
          "atoi": {
            "color": "blue",
            "shape": "block-only"
          },
          "atol": {
            "color": "blue",
            "shape": "block-only"
          },
          "atoll": {
            "color": "blue",
            "shape": "block-only"
          },
          "bsearch": {
            "color": "blue",
            "shape": "block-only"
          },
          "calloc": {
            "color": "blue",
            "shape": "block-only"
          },
          "div": {
            "color": "blue",
            "shape": "block-only"
          },
          "drand48": {
            "color": "blue",
            "shape": "block-only"
          },
          "exit": {
            "color": "blue",
            "shape": "block-only"
          },
          "free": {
            "color": "blue",
            "shape": "block-only"
          },
          "getenv": {
            "color": "blue",
            "shape": "block-only"
          },
          "labs": {
            "color": "blue",
            "shape": "block-only"
          },
          "ldiv": {
            "color": "blue",
            "shape": "block-only"
          },
          "llabs": {
            "color": "blue",
            "shape": "block-only"
          },
          "lldiv": {
            "color": "blue",
            "shape": "block-only"
          },
          "malloc": {
            "color": "blue",
            "shape": "block-only"
          },
          "mblen": {
            "color": "blue",
            "shape": "block-only"
          },
          "mbstowcs": {
            "color": "blue",
            "shape": "block-only"
          },
          "mbtowc": {
            "color": "blue",
            "shape": "block-only"
          },
          "qsort": {
            "color": "blue",
            "shape": "block-only"
          },
          "rand": {
            "color": "blue",
            "shape": "block-only"
          },
          "realloc": {
            "color": "blue",
            "shape": "block-only"
          },
          "srand": {
            "color": "blue",
            "shape": "block-only"
          },
          "srand48": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtod": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtof": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtol": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtold": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtoll": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtoul": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtoull": {
            "color": "blue",
            "shape": "block-only"
          },
          "system": {
            "color": "blue",
            "shape": "block-only"
          },
          "wcstombs": {
            "color": "blue",
            "shape": "block-only"
          },
          "wctomb": {
            "color": "blue",
            "shape": "block-only"
          },
          "memchr": {
            "color": "blue",
            "shape": "block-only"
          },
          "memcmp": {
            "color": "blue",
            "shape": "block-only"
          },
          "memcpy": {
            "color": "blue",
            "shape": "block-only"
          },
          "memmove": {
            "color": "blue",
            "shape": "block-only"
          },
          "memset": {
            "color": "blue",
            "shape": "block-only"
          },
          "strcat": {
            "color": "blue",
            "shape": "block-only"
          },
          "strchr": {
            "color": "blue",
            "shape": "block-only"
          },
          "strcmp": {
            "color": "blue",
            "shape": "block-only"
          },
          "strcoll": {
            "color": "blue",
            "shape": "block-only"
          },
          "strcpy": {
            "color": "blue",
            "shape": "block-only"
          },
          "strcspn": {
            "color": "blue",
            "shape": "block-only"
          },
          "strerror": {
            "color": "blue",
            "shape": "block-only"
          },
          "strlen": {
            "color": "blue",
            "shape": "block-only"
          },
          "strncat": {
            "color": "blue",
            "shape": "block-only"
          },
          "strncmp": {
            "color": "blue",
            "shape": "block-only"
          },
          "strncpy": {
            "color": "blue",
            "shape": "block-only"
          },
          "strpbrk": {
            "color": "blue",
            "shape": "block-only"
          },
          "strrchr": {
            "color": "blue",
            "shape": "block-only"
          },
          "strspn": {
            "color": "blue",
            "shape": "block-only"
          },
          "strstr": {
            "color": "blue",
            "shape": "block-only"
          },
          "strtok": {
            "color": "blue",
            "shape": "block-only"
          },
          "strxfrm": {
            "color": "blue",
            "shape": "block-only"
          },
          "acos": {
            "color": "blue",
            "shape": "block-only"
          },
          "acosh": {
            "color": "blue",
            "shape": "block-only"
          },
          "asin": {
            "color": "blue",
            "shape": "block-only"
          },
          "asinh": {
            "color": "blue",
            "shape": "block-only"
          },
          "atan": {
            "color": "blue",
            "shape": "block-only"
          },
          "atan2": {
            "color": "blue",
            "shape": "block-only"
          },
          "atanh": {
            "color": "blue",
            "shape": "block-only"
          },
          "ceil": {
            "color": "blue",
            "shape": "block-only"
          },
          "copysign": {
            "color": "blue",
            "shape": "block-only"
          },
          "cos": {
            "color": "blue",
            "shape": "block-only"
          },
          "cosh": {
            "color": "blue",
            "shape": "block-only"
          },
          "erf": {
            "color": "blue",
            "shape": "block-only"
          },
          "erfc": {
            "color": "blue",
            "shape": "block-only"
          },
          "exp": {
            "color": "blue",
            "shape": "block-only"
          },
          "exp2": {
            "color": "blue",
            "shape": "block-only"
          },
          "expm1": {
            "color": "blue",
            "shape": "block-only"
          },
          "fabs": {
            "color": "blue",
            "shape": "block-only"
          },
          "fdim": {
            "color": "blue",
            "shape": "block-only"
          },
          "floor": {
            "color": "blue",
            "shape": "block-only"
          },
          "fma": {
            "color": "blue",
            "shape": "block-only"
          },
          "fmax": {
            "color": "blue",
            "shape": "block-only"
          },
          "fmin": {
            "color": "blue",
            "shape": "block-only"
          },
          "fmod": {
            "color": "blue",
            "shape": "block-only"
          },
          "fpclassify": {
            "color": "blue",
            "shape": "block-only"
          },
          "frexp": {
            "color": "blue",
            "shape": "block-only"
          },
          "ilogb": {
            "color": "blue",
            "shape": "block-only"
          },
          "isfinite": {
            "color": "blue",
            "shape": "block-only"
          },
          "isgreater": {
            "color": "blue",
            "shape": "block-only"
          },
          "isgreaterequal": {
            "color": "blue",
            "shape": "block-only"
          },
          "isinf": {
            "color": "blue",
            "shape": "block-only"
          },
          "isless": {
            "color": "blue",
            "shape": "block-only"
          },
          "islessequal": {
            "color": "blue",
            "shape": "block-only"
          },
          "islessgreater": {
            "color": "blue",
            "shape": "block-only"
          },
          "isnan": {
            "color": "blue",
            "shape": "block-only"
          },
          "isnormal": {
            "color": "blue",
            "shape": "block-only"
          },
          "isunordered": {
            "color": "blue",
            "shape": "block-only"
          },
          "ldexp": {
            "color": "blue",
            "shape": "block-only"
          },
          "llrint": {
            "color": "blue",
            "shape": "block-only"
          },
          "llround": {
            "color": "blue",
            "shape": "block-only"
          },
          "log": {
            "color": "blue",
            "shape": "block-only"
          },
          "log10": {
            "color": "blue",
            "shape": "block-only"
          },
          "log1p": {
            "color": "blue",
            "shape": "block-only"
          },
          "log2": {
            "color": "blue",
            "shape": "block-only"
          },
          "logb": {
            "color": "blue",
            "shape": "block-only"
          },
          "lrint": {
            "color": "blue",
            "shape": "block-only"
          },
          "lround": {
            "color": "blue",
            "shape": "block-only"
          },
          "modf": {
            "color": "blue",
            "shape": "block-only"
          },
          "nearbyint": {
            "color": "blue",
            "shape": "block-only"
          },
          "pow": {
            "color": "blue",
            "shape": "block-only"
          },
          "remainder": {
            "color": "blue",
            "shape": "block-only"
          },
          "remquo": {
            "color": "blue",
            "shape": "block-only"
          },
          "rint": {
            "color": "blue",
            "shape": "block-only"
          },
          "round": {
            "color": "blue",
            "shape": "block-only"
          },
          "scalbln": {
            "color": "blue",
            "shape": "block-only"
          },
          "scalbn": {
            "color": "blue",
            "shape": "block-only"
          },
          "signbit": {
            "color": "blue",
            "shape": "block-only"
          },
          "sin": {
            "color": "blue",
            "shape": "block-only"
          },
          "sinh": {
            "color": "blue",
            "shape": "block-only"
          },
          "sqrt": {
            "color": "blue",
            "shape": "block-only"
          },
          "tan": {
            "color": "blue",
            "shape": "block-only"
          },
          "tgamma": {
            "color": "blue",
            "shape": "block-only"
          },
          "trunc": {
            "color": "blue",
            "shape": "block-only"
          },
          "asctime": {
            "color": "blue",
            "shape": "block-only"
          },
          "clock": {
            "color": "blue",
            "shape": "block-only"
          },
          "ctime": {
            "color": "blue",
            "shape": "block-only"
          },
          "difftime": {
            "color": "blue",
            "shape": "block-only"
          },
          "mktime": {
            "color": "blue",
            "shape": "block-only"
          },
          "strftime": {
            "color": "blue",
            "shape": "block-only"
          },
          "time": {
            "color": "blue",
            "shape": "block-only"
          },
          "isalnum": {
            "color": "blue",
            "shape": "block-only"
          },
          "isalpha": {
            "color": "blue",
            "shape": "block-only"
          },
          "isblank": {
            "color": "blue",
            "shape": "block-only"
          },
          "iscntrl": {
            "color": "blue",
            "shape": "block-only"
          },
          "isdigit": {
            "color": "blue",
            "shape": "block-only"
          },
          "isgraph": {
            "color": "blue",
            "shape": "block-only"
          },
          "islower": {
            "color": "blue",
            "shape": "block-only"
          },
          "isprint": {
            "color": "blue",
            "shape": "block-only"
          },
          "ispunct": {
            "color": "blue",
            "shape": "block-only"
          },
          "isspace": {
            "color": "blue",
            "shape": "block-only"
          },
          "isupper": {
            "color": "blue",
            "shape": "block-only"
          },
          "isxdigit": {
            "color": "blue",
            "shape": "block-only"
          },
          "tolower": {
            "color": "blue",
            "shape": "block-only"
          },
          "toupper": {
            "color": "blue",
            "shape": "block-only"
          },
          "va_arg": {
            "color": "blue",
            "shape": "block-only"
          },
          "va_copy": {
            "color": "blue",
            "shape": "block-only"
          },
          "va_end": {
            "color": "blue",
            "shape": "block-only"
          },
          "va_start": {
            "color": "blue",
            "shape": "block-only"
          }
        }
      }
    }
  };

  main.consumes = ["Plugin", "Editor", "editors", "tabManager", "ace", "ui", "commands", "menus"];
  main.provides = ["droplet"];
  return main;

  function main(options, imports, register) {
    console.log('Main is running');
    var Plugin = imports.Plugin;
    var tabManager = imports.tabManager;
    var ace = imports.ace;
    var ui = imports.ui;
    var commands = imports.commands;
    var menus = imports.menus;

    /***** Initialization *****/

    var plugin = new Plugin("Ajax.org", main.consumes);
    var emit = plugin.getEmitter();

    ui.insertCss(require("text!./droplet/css/droplet.css"), plugin);
    ui.insertCss(require("text!./tooltipster/dist/css/tooltipster.bundle.min.css"), plugin);
    ui.insertCss(require("text!./tooltipster-style.css"), plugin)

    window._lastEditor = null;

    menus.addItemByPath('View/Toggle Blocks', {
      command: "droplet_toggle"
    }, 0, plugin);

    function load() {
      tabManager.once("ready", function() {
        tabManager.getTabs().forEach(function(tab) {
          var ace = tab.path && tab.editor.ace;
          if (ace && tab.editorType == "ace") {
            attachToAce(tab.editor.ace);
          }
        });
        ace.on("create", function(e) {
          console.log('Just created! Binding now.');
          e.editor.on("createAce", attachToAce, plugin);
        }, plugin);
      });
    }

    function unload() {
      tabManager.getTabs().forEach(function(tab) {
        var ace = tab.path && tab.editor.ace;
        if (ace) {
          detachFromAce(tab.editor.ace);
        }
      });
      dropletEditor = null;
    }

    /***** Methods *****/

    function applyGetValueHack(aceSession, dropletEditor) {

    }

    function attachToAce(aceEditor) {
      console.log('Attached to ace editor!');
      if (!aceEditor._dropletEditor) {
        var worker = createWorker('./droplet/dist/worker.js');
        var currentValue = aceEditor.getValue();
        var dropletEditor = aceEditor._dropletEditor = new droplet.Editor(aceEditor, lookupOptions(aceEditor.getSession().$modeId), worker);

        dropletEditor.on('palettechange', function() {
          $(dropletEditor.paletteCanvas.children).each(function(index) {
            var title = Array.from(this.children).filter(function(child) { return child.tagName === 'title'; })[0];

            if (title != null) {
              this.removeChild(title);
              console.log("I am calling tooltipster now.", title.textContent);

              var element = $('<div>').html(title.textContent)[0];

              $(this).tooltipster({
                position: 'right',
                interactive: true,
                content: element,
                theme: ['tooltipster-noir', 'tooltipster-noir-customized'],
                contentCloning: true,
                maxWidth: 300
              });
            }
          });
        });

        if (dropletEditor.session != null) {
         applyGetValueHack(aceEditor.getSession(), aceEditor._dropletEditor);
        }

        // Restore the former top margin (for looking contiguous with the tab)
        dropletEditor.wrapperElement.style.top = '7px';

        dropletEditor.on('change', function() {
          setTimeout(function() {
            if (dropletEditor.session && dropletEditor.session.currentlyUsingBlocks) {
              console.log('Setting ace value');
              dropletEditor.setAceValue(dropletEditor.getValue());
            }
          }, 0);
        })

        _lastEditor = dropletEditor; // for debugging
        aceEditor._dropletEditor.setValueAsync(currentValue);

        var button = document.createElement('div');
        button.className = 'c9-droplet-toggle-button';

        // TODO move to a stylesheet
        // TODO a block shape SVG?
        button.innerText = '';
        button.style.position = 'absolute';
        button.style.right = '-30px';
        button.style.width = '30px';
        button.style.height = '50px';
        button.style.top = '50%';
        button.style.bottom='50%';
        button.style.marginTop = '-25px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '6px 0 6px -6px gray';
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        button.style.borderTopRightRadius = button.style.borderBottomRightRadius = '5px';
        dropletEditor.paletteElement.appendChild(button);

        if (!aceEditor._dropletEditor.session || !aceEditor._dropletEditor.session.currentlyUsingBlocks) {
          button.style.display = "none";
        }

        button.addEventListener('click', function() {
          aceEditor._dropletEditor.toggleBlocks();
        });

        // here we get an instance of ace
        // we can listen for setSession
        // and create droplet editor attached to this ace instance
        // it can work similar to http://pencilcode.net/edit/first
        // where there is a widget on the gutter displayed for all coffee files
        aceEditor.on("changeSession", function(e) {
          if (aceEditor._dropletEditor.hasSessionFor(e.session)) {
            button.style.display = 'block';
          }
          else {
            var option = lookupOptions(e.session.$modeId);
            if (option != null) {
              aceEditor._dropletEditor.bindNewSession(option);
              applyGetValueHack(aceEditor.getSession(), aceEditor._dropletEditor);
              button.style.display = 'block';
            }
            else {
              button.style.display = 'none';
            }
          }
          window.lastBoundSession = e.session;
          e.session.on('changeMode', function(e) {
            if (aceEditor._dropletEditor.hasSessionFor(aceEditor.getSession())) {
             aceEditor._dropletEditor.setMode(lookupMode(aceEditor.getSession().$modeId), lookupModeOptions(aceEditor.getSession().$modeId));
             aceEditor._dropletEditor.setPalette(lookupPalette(aceEditor.getSession().$modeId));
            } else {
              var option = lookupOptions(aceEditor.getSession().$modeId);
              if (option != null) {
                aceEditor._dropletEditor.bindNewSession(option);
                applyGetValueHack(aceEditor.getSession(), aceEditor._dropletEditor);
                button.style.display = 'block';
              }
              else {
                button.style.display = 'none';
              }
            }
          });
        });

        // Bind to mode changes
        aceEditor.getSession().on('changeMode', function(e) {
          if (aceEditor._dropletEditor.hasSessionFor(aceEditor.getSession())) {
            aceEditor._dropletEditor.setMode(lookupMode(aceEditor.getSession().$modeId), lookupModeOptions(aceEditor.getSession().$modeId));
            aceEditor._dropletEditor.setPalette(lookupPalette(aceEditor.getSession().$modeId));
          }
          else {
            var option = lookupOptions(aceEditor.getSession().$modeId);
            if (option != null) {
              aceEditor._dropletEditor.bindNewSession(option);
              button.style.display = 'block';
           }
            else {
              button.style.display = 'none';
            }
          }
        });

        // Bind to the associated resize event
        tabManager.getTabs().forEach(function(tab) {
          var ace = tab.path && tab.editor.ace;
          if (ace == aceEditor && tab.editorType == 'ace') {
            tab.editor.on('resize', function() {
              dropletEditor.resize();
            });
          }
        });
      }

      function lookupOptions(mode) {
        if (mode in OPT_MAP) {
          return OPT_MAP[mode];
        }
        else {
          return null;
        }
      }

      function lookupMode(id) {
        return (OPT_MAP[id] || {mode: null}).mode;
      }
      function lookupModeOptions(id) {
        return (OPT_MAP[id] || {mode: null}).modeOptions;
      }
      function lookupPalette(id) {
        return (OPT_MAP[id] || {palette: null}).palette;
      }

    }

    function detachFromAce(ace) {

    }

    plugin.on("resize", function() {
      alert('hello');
    })

    /***** Lifecycle *****/

    plugin.on("load", function() {
      load();
    });
    plugin.on("unload", function() {
      unload();
    });

    /***** Register and define API *****/

    plugin.freezePublicAPI({

    });

    register(null, {
      "droplet": plugin
    });
  }
});

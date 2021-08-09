// open IIFE
(function () {
  /**
   * a reflection
   */
  function identity (a) {
    return a;
  }
/*

we'll expect an array of comic book issues.

issues have a cover image, title, writer, illustrator, colorist, inker, publisher, series, character; etc., "n fields" are present.

we need the following:

- a "comic book issue" display "component"
- a factory that returns new comic book issue components

the comic book issue component may be rendered differently, and respond to different user inputs, when rendered at different viewport dimensions and/or on different browsers and devices.

the factory wil be called by some other logic, in this case where the application fetches data and wants to display one or more comic book issues. it's up to the application to decide how and where to append those elements to the DOM.

*/
// the data model / types / transformations for a comic book issue
var schema = [
  {
    name: "title",
    type: String,
    required: true
  },
  {
    name: "subtitle",
    type: String
  },
  {
    name: "description",
    type: String
  },
  {
    name: "snippet",
    type: String
  },
  {
    name: "publishedDate",
    type: String,
    transform: function (value) {
      try {
        return new Date(value).toISOString();
      } catch (ex) {
        console.error("invalid date string at:\n", ex);
        return value;
      }
    }
  },
  {
    name: "publisher",
    type: String
  },
  {
    name: "mature",
    type: String
  },
  {
    name: "language",
    type: String
  },
  {
    name: "isbn",
    type: Number
  },
  {
    name: "pageCount",
    type: Number
  },
  {
    name: "thumbnailURL",
    type: String
  },
  {
    name: "coverURL",
    type: String
  }
];

// set up a global namespace for the library
var public = Object.create(null);

Object.defineProperty(window, "bmr", {
  value: public
});

/**
 * Represents a comic book issue.
 * @constructor
 * @param {Object} details - a parsed JSON object with the following (optional) keys:
 * @param {string} details.title - the issue title.
 * @param {string} details.subtitle - a subtitle for the issue.
 * @param {string} details.description - a description of the issue.
 * @param {string} details.snippet - publisher's promotional copy.
 * @param {string} details.publishedDate - the date published.
 * @param {string} details.publisher - the publisher.
 * @param {string} details.mature - flags issues containing explicit content.
 * @param {string} details.language - the language.
 * @param {string} details.isbn - the isbn code.
 * @param {string} details.pageCount - the number of pages.
 * @param {string} details.thumbnailURL - the URL for a thumbnail image of the issue.
 * @param {string} details.coverURL - the URL for the issue's cover image.
 */
function Issue (details) {
  // define an empty object for the instance props
  var props = this.props = Object.create(null);
  // assign instance props
  for (var ndx = 0; ndx < schema.length; ndx++) {
    // get a reference to the model
    var model = schema[ndx];
    // is this property in details
    if (Object.prototype.hasOwnProperty.call(details, model.name)) {
      // primitive type checking
      if (details[model.name].constructor !== model.type) {
        throw new TypeError("property " + model.name + " must be of type " + model.type.name);
      }
    } else if (model.required) {
      // force these properties to be included
      throw new Error("property " + model.name + " is required");
    }
    // set the property or default empty value for the type
    Object.defineProperty(props, model.name, {
      value: (model.transform || identity)(details[model.name] || new model.type())
    });
  }
}

// define instance methods of comic book issues
Object.defineProperties(Issue.prototype, {
  render: {
    /**
     * returns a DOM node
     */
    value: function render () {
      // get an accessor for props set at instantiation time
      var props = this.props;
      // inject the props into a template for the component
      var template = "\
        <div class=\"issue\">\
          <header>\
            <span class=\"title\">" + props["title"] + "</span>\
          </header>\
        </div>\
      ";
      // wrap the retun in an IIFE so references to props can be forgotten
      return (function (html = "") {
        // create a DOM node, this could be a custom element in the future
        const el = document.createElement("div");
        // should sanitize the html string before we ask the DOM to parse it
        el.innerHTML = html;
        // return the element
        return el;
      })(template);
    }
  }
});

// "export" the factory as a library method named "create"
Object.defineProperty(public, "create", {
  value: function (details) {
    return new Issue(details);
  }
});

// close IIFE
})();

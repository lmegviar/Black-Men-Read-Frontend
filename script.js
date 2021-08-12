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
    type: Number
  },
  {
    name: "language",
    type: String
  },
  {
    name: "isbn",
    type: String
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
 * @param {number} details.mature - flags issues containing explicit content.
 * @param {string} details.language - the language.
 * @param {string} details.isbn - the isbn code.
 * @param {number} details.pageCount - the number of pages.
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
      if (
        // an abstract equality comparison (== instead of ===,)
        // does not discriminate between undefined and null types
        details[model.name] != null &&
        details[model.name].constructor !== model.type
      ) {
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

// define a templates library for the Issue class
Object.defineProperty(Issue, "templates", {
  value: {
    /**
     * returns the HTML for a thumbs-up/down rating
     * note that the isbn can be used to query issue ratings in the DOM
     */
    rating: function (props) {
      var isbn = props.isbn;
      return "\
        <article class=\"thumbs-rating\">\
          <form>\
            <label class=\"thumbs-up\" class=\"hidden\" for=\"" + isbn + "-yes\">\
              <input  type=\"radio\" id=\"" + isbn + "-yes\" name=\"" + isbn + "\" value=\"yes\">\
            </label>\
            <label class=\"hidden\" for=\"" + isbn + "-no\">\
              <input class=\"thumbs-down\" type=\"radio\" id=\"" + isbn + "-no\" name=\"" + isbn + "\" value=\"no\">\
            </label>\
          </form>\
        </article>\
      ";
    },
    /**
     * returns the HTML for a thumbnail image of the issue
     */
    thumbnail: function (props) {
      return "\
        <article class=\"thumbnail\">\
          <section class=\"cover\">\
            <img src=\"" + props.thumbnailURL + "\" alt=\"a thumbnail image for " + props.title + "\" \\>\
          </section>\
          <footer>\
            <a href=\"" + props.thumbnailURL + "\">image source: grand comic database</a>\
          </footer>\
        </article>\
      ";
    },
    /**
     * returns the HTML for a mobile-first comic book issue
     */
    mobile: function (props) {
      return "\
        <article class=\"issue\">\
          <header>\
            <h2 class=\"title\">" + props.title + "</h2>\
            <p class=\"subtitle\">" + props.subtitle + "</p>\
          </header>\
          <section class=\"cover\">\
            <h3 class=\"hidden\">cover image</h3>\
            <img src=\"" + props.coverURL + "\" alt=\"a cover image for " + props.title + "\" \\>\
          </section>\
          <section class=\"details\">\
            <h3 class=\"hidden\">details</h3>\
            <p class=\"description\">" + props.description + "</p>\
            <p class=\"snippet\">" + props.snippet + "</p>\
            <p class=\"publishedDate\">" + props.publishedDate + "</p>\
            <p class=\"publisher\">" + props.publisher + "</p>\
            <p class=\"mature\">" + props.mature + "</p>\
            <p class=\"language\">" + props.language + "</p>\
            <p class=\"isbn\">" + props.isbn + "</p>\
            <p class=\"pageCount\">" + props.pageCount + "</p>\
          </section>\
          <footer>\
            <a href=\"" + props.coverURL + "\">image source: grand comic database</a>\
          </footer>\
        </article>\
      ";
    }
  }
});

// define instance methods of comic book issues
Object.defineProperties(Issue.prototype, {
  render: {
    /**
     * returns different DOM nodes.
     * @param{string} template - one of the following: "mobile", "thumbnail", "rating"
     */
    value: function render (templateName, tagName = "div") {
      // get an accessor for props set at instantiation time
      var props = this.props;
      // inject the props into a template for the component
      try {
        // get the html template
        var template = Issue.templates[templateName](props);
      } catch (exception) {
        // be descriptive
        throw new Error("Unknown template: " + templateName + ". Accepted: " + Object.keys(Issue.templates).join(", "));
      }
      // wrap the retun in an IIFE so we are isolating the DOM process
      return (function (html, tag) {
        // create a DOM node, this could be a custom element in the future
        const el = document.createElement(tag);
        // should sanitize the html string before we ask the DOM to parse it
        el.innerHTML = html;
        // return the element
        return el;
      })(template, tagName);
    }
  }
});

// expose the factory as a library method named "create"
Object.defineProperty(public, "create", {
  value: function (details) {
    return new Issue(details);
  }
});

// close IIFE
})();

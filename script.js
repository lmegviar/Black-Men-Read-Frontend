// open IIFE
(function () {
  function identity (a) {
    return a;
  }
/*

we'll expect an array of comic book issues.

issues have a cover image, title, writer, illustrator, colorist, inker, publisher, series, character; etc., "n fields" are present.

we need the following:

* a "comic book issue" display "component"
* a factory that returns new comic book issue components

the comic book issue component may be rendered differently, and respond to different user inputs, when rendered at different viewport dimensions and/or on different browsers and devices.

the factory wil be called by some other logic, in this case where the application fetches data and wants to display one or more comic book issues. it's up to the application to decide how and where to append those elements to the DOM.

*/

const issueDetailsModel = [
  {
    name: "title",
    type: String
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

const issueRequired = [
  "title",
  "coverURL"
];

// set up a global namespace for the library
const public = Object.create(null);
// yes we could have collisions
window.bmr = public;

/**
 * Iterates through the issueDetailsModel, basically forEach
 */
function eachIssueModel (fn) {
  for (var ndx = 0; ndx < issueDetailsModel.length; ndx++) {
    fn(issueDetailsModel[ndx]);
  }
}

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
function ComicBookIssue (details) {
  // define an empty object for the instance props
  var props = this.props = Object.create(null);
  // reference the data model and assign instance props
  eachIssueModel(function (model) {
    if (
      Object.prototype.hasOwnProperty.call(details, model.name) === false &&
      issueRequired.indexOf(model.name) > -1
    ) {
      throw new Error("property " + model.name + " is required");
    }
    Object.defineProperty(props, model.name, {
      value: (model.transform || identity)(details[model.name] || new model.type())
    });
  })
}

// define instance methods of comic book issues
Object.defineProperties(ComicBookIssue.prototype, {
  render: {
    value: function () {
      // return a DOM node. this could eventually be a custom element.
      var issue = document.createElement("div");
      // create the structure of the component
      issue.innerHTML = "                                  \
                                                           \
        <div class=\"issue\">                              \
        </div>                                             \
                                                           \
      ";
      // return the DOM node
      return issue;
    }
  }
});

// "export" the factory as a library method named "create"
Object.defineProperty(public, "create", {
  value: function (details) {
    return new ComicBookIssue(details);
  }
});

// close IIFE
})();

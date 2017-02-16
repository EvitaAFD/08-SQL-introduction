'use strict';
//collaborated with Castro, Brandon, and Morgan
function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  //returns array of the properties of a given object, forEach executes anonymous function on each object in array
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.loadAll
 * - Describe what the method does: Receives data that we query from Sequel server and preps the data for use in our html
 * - Inputs: An array containing data queried from our server
 * - Outputs: for every element in the rows array sort according to date create an article object and store that object onto the all property of the artice constructor function
 */
Article.loadAll = function(rows) {
  // DONE: if the result of b-a is less than 0 then it will move (a) into a lower postion in the array and come first , if the reuslt is greater than 0 then (b) comes first
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: for every piece of data at each element in array will instatiate article object based on the data and push that object onto the all property attached to artcile constructor
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.fetchAll
 * - Describe what the method does: checks to see if there are records in the database and then loads or creates the records depending on the result
 * - Inputs: a callback function of article view.initIndexPage which is coming from articleView.js and invoked on index.html
 * - Outputs: no outputs
 */
Article.fetchAll = function(callback) {
  // DONE: Calling ajax selector for the /articles location
  $.get('/articles')
  // DONE: once the /articles selector has been called then it begins a function with and if/else statement taking the results of .get as it's argument
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: feed them into the Artcile.loadAll method and invokes articleViewInitIndex page method through the callback alias
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // TODONE: pull the records from the static file hackerIpsum then push those records into database
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: after creating the data in the database come back around and call the fetchAll method with intent of triggering the if result versus the else
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: if the output is something other than what is covered in the if/else throw an error and log it to the console
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.truncateTable
 * - Describe what the method does: this method on Article called truncateTable takes an parameter of callback and uses AJAX to get and delete the articles url
 * - Inputs: takes the input of artciles url and the truncated data that is given back from the server
 * - Outputs: outputs the truncated data to the console
 */
Article.truncateTable = function(callback) {
  // DONE: Calling  AJAX selector to get the artciles url and tells it to delete aka truncate that selection from the table
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: then creating a function that retreives the data from the server and logs the data to the console, if there is a callback it then executes the callback function
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.prototype.insertRecord
 * - Describe what the method does: adds data to our Sequel database, into the /articles table
 * - Inputs: an Artcile object instance
 * - Outputs: logs the data from the insertion
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: send an instance of an article object to our articles url to then be stored in database, and then once the object has been stored on database it gives us response that this has been added-lines up with app.post
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: checking for existance of callback then call it
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - Describe what the method does: makes an AJAX HTTP request on an article of a particular ID and deletes it. After the AJAX call completes, the data that was deleted is logged, and if a callback function has been passed as an argument, it will run.
 * - Inputs: callback function argument and the id of instance it is called on
 * - Outputs: a console log of the data, and the data into the table, updated database
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: ajax call accessing at the articles id and uses a method to delete what is located at that instance of article in database
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: when ajax call is finished it console logs the data it's received and if a callback function was passed as an argument it is invoked
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.prototype.updateRecord
 * - Describe what the method does: This method attaches a prototype of updateRecord to Article.  It uses AJAX to get a particular article id and puts the data listed into the table if a callback function has been passed as an argument, it will run.
 * - Inputs: article id and the data from the data from within the Article function
 * - Outputs: the data added to the table
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: AJAX call accessing at the instance of a particular articles id and updating the data listed below into the table
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: this is giving the properties of the below data to be updated in the table
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: This is indicating that after the above is inputted into the table then log the data added and if the callback function is there, run the callback function
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

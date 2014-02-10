define(function(require) {
  var $ = require('jquery'),
      _ = require('lodash');

  /*   
  *   Pooling Object
  */
  var Pool = function(options) {

    _.extend(this, _.pick(options, ['model', 'collection']));
    
    this.size = options.size;
    this.used = [];
    this.free = [];   
    this.type = options.type;
    this.full = false;


    _.extend(this.type.prototype, {
      free: function() {
        this.free.push(this.used.splice(this.used.indexOf(this), 1));
        this.unbind();
      },
    });

    options.fill && this.fill();
  };

  _.extend(Pool.prototype, Backbone.Events, {
    /*
    * Instantiate pool of size specified by constructor argument 
    * size. After the first call fill acts as a no-op.
    */
    fill: function(options) {
      while(!(this.full = ((this.free.length + this.used.length) === this.size))){
          this.free.push(new this.type({ model: this.model, collection: this.collection}));    
      }
    },
    /*
    *  Returns n free objects from the pool. If the requested object(s) exceeds available count, the size of the pool
    *  will be increased and the user will be warned. 
    */
    get: function(num) {
      var pop, popped;
      num = num || 1;

      while(num-- && (pop = this.free.pop())) {
          popped.push(this.used[this.used.push(pop)-1]);
      }      

      if(popped.length < num) {
          while(popped.length != num) {
              popped.push(this.used[this.used.push(new this.type({ model: this.model, collection: this.collection }))-1]);
              this.size++;
          }
      }
      return popped;
    },
    drain: function() {
      var popped;
      while(popped = this.used.pop()){
          popped.unbind();
          this.free.push(popped);
      }
    }
  });
  return Pool;
});

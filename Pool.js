define(
    [
        'jquery', 
        'underscore',
        'backbone'
    ],
    function($, _, Backbone) {
       
       /*   
        *   Private Pooling Object
        */
        var Pool = Backbone.Pool = function(options) {
            
            _.extend(this, _.pick(options, ['model', 'collection']));
            this.options          = options;


            this._size            = this.options.size;
            this._used            = [];
            this._free            = [];   
            this._type            = this.options.type;
            this._full            = false;
           
            
           //decorate pools pbject type with life cycle methods 
            _.extend(this._type.prototype, {
                free: function() {
                    this._free.push(this._used.splice(this._used.indexOf(this), 1));
                },
                unbind: function() {
                    this.modelsOff(this.model);
                    this.collectionsOff(this.collection);
                },
                rebind: function() {
                    throw new Error("You must implement rebind");
                }
            });
            this.fill();
        };
        
        _.extend(Pool.prototype, Backbone.Events, {
            /*
             * Instantiate pool of size specified by constructor argument 
             * size. After the first call fill acts as a no-op.
             */
            fill: function(options) {
                while(!(this._full = ((this._free.length + this._used.length) === this._size))){
                    this._free.push(new this._type);    
                }
            },
            /*
             *  Returns n free objects from the pool. If the requested object(s) exceeds available count, the size of the pool
             *  will be increased and the user will be warned.; 
             */
            get: function(num) {
                var pop, popped;
                (num || num = 1);

                while(num-- && (pop = this._free.pop()) {
                    popped.push(this._used[this._used.push(pop)-1]);
                }       

                if(popped.length < num) {
                    console.warn('You requested more objects then originally allocated.  Adding new objects to the pool');
                    while(popped.length != num) {
                        popped.push(this._used[this._used.push(new this._type)-1]);
                    }
                }
                return popped;
            },
            drain: function() {
                var popped;
                while(popped = this._used.pop()){
                    popped.unbind();
                    this._free.push(popped);
                }
            }
            modelsOff: function (model) {
                if (model instanceof Backbone.Model) {
                    model.off(null, null, this);
                } else {
                    _(model).each(function(m) { 
                        this.modelsOff(m); 
                    },this);
                }
                return this;
            },
            collectionsOff: function(collection) {
                if (collection instanceof Backbone.Collection) {
                    collection.off(null, null, this);
                } else {
                    _(collection).each(function(coll) {
                        this.collectionsOff(coll);
                    }, this);
                }
                return this;
            },
        });

        return Pool;

    } 
);

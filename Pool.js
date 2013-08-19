define(
    [
        'jquery', 
        'underscore',
        'backbone'
    ],
    function($, _, Backbone) {
       
       /*   
        *   Pooling Object
        */
        var Pool = Backbone.Pool = function(options) {
            
            _.extend(this, _.pick(options, ['model', 'collection']));
            this.options         = options;

            /*
             * Public Instance Members
             */
            this.size            = this.options.size;
            this.used            = [];
            this.free            = [];   
            this.type            = this.options.type;
            this.full            = false;
           
            
           /*
            * Decorate pools object type with life cycle methods.
            */ 
            _.extend(this.type.prototype, {
                free: function() {
                    this.free.push(this.used.splice(this.used.indexOf(this), 1));
                    this.unbind();
                },
                /*
                 * What if the consumer overrode a method called bindings.  In the method the specified
                 * obects and arguments.  The implicit suggest would be that on instantiaon we will 
                 * turn on all listeners and that  on calls to 'unbind', we have a means of turning 
                 * off all listeners. 
                 *
                 * imagine...
                 *
                 * bindings: [
                 *     [this.model.result.results, 'reset', <callback>, this],   
                 *     [this.model.report.entry.content, 'change:foo', <callback>, this],   
                 *     [this.model.this.model.summary.fields, 'reset', <callback>, this],   
                 *     ..... 
                 * ]
                 *
                 * this would give us complete control to unbind/rebind 
                 *
                 */
                unbind: function() {
                    var allChildren = [],
                        collectChildrn = (function(children) {
                            _(children).each(function(child) {
                                collectChildren(child.children);
                                allChildren.push(child);
                            });
                        })(this.children);
                   
                    _(allChildren).each(function(child) {
                        this.modelsOff(child.model);
                        this.collectionsOff(child.collection);
                    },this);
                },
                rebind: function() {
                    //need to contemplate implications of deep interface
                    throw new Error("You must implement rebind");
                }
            });
            
            this.options.fill && this.fill();
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
            }
        });

        return Pool;

    } 
);

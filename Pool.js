define(
    [
        'jquery', 
        'underscore',
        'backbone'
    ],
    function($, _, Backbone) {
        
        var Pool = Backbone.Pool = function(size) {
           this._size            = size;
           this._used            = [];
           this._free            = [],   
           this._full            = false;
        };
        
        _.extend(Pool.prototype = {
            /*
             * Instantiate pool of this._size specified by constructor argument 
             * this._size. After the first call fill acts as a no-op.
             */
            fill: function(Obj) {
                
                //store internal reference to type for this pool
                this._type = Obj;

                //decorate type with a this._free method to manually 
                //
                this._type.prototype.free = function() {
                    this._free.push(this._used.splice(this._used.indexOf(this), 1));
                };

                if(!this._full){
                    for(;;) { 
                        if(!this._full = (this._free.length === this._size)) 
                            break;
                        this._free.push(new this._type);
                    }
                }
            },
            /*
             *  Returns a free object from the pool. If no object is available, the this._size of the pool
             *  will be incremented by one. 
             */
            get: function() {
                var popped = this._free.pop();
                if(popped) {
                    return this._used[this._used.push(popped)-1]; 
                }  else {
                    console.log('You requested more objects then originally allocated.  Adding object to the pool');
                    return this._used[this._used.push(new this._type)-1];
                }
            },
            drain: function() {
                var popped;
                while(popped = this._used.pop()){
                    this._free.push(popped);
                }
            }
        };
    
    } 


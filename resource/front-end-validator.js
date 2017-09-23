function closest(el, selector) {
	try {
	    if(!el.parentNode){
	     	throw new Error('Element by querySelector "' + selector + '" not found!');
	    } else {
	    	return el.parentNode.querySelector(selector) ? el : closest(el.parentNode, selector);
	    }
  	} catch (e) {
    	console.error(e.name + ': ' + e.message);
  	}
}



function FrontEndValidator(params){
	var self = this;

    // PRIVATE VARS ------------------------------------

    var _valid = true,
    	_data = undefined,
    	_selfElemSelector = undefined,
    	_parentElemSelector = undefined,
    	_parentElements = undefined;

    // end PRIVATE VARS --------------------------------



    // PROPERIES ---------------------------------------

    this.selfElem = undefined;
    this.inputs = undefined;
    this.timeDirection = undefined;
    this.debug = true;

    // end PROPERIES -----------------------------------



    // INIT --------------------------------------------

    function init(params){

    	try {

       		if(!params.data){
       			throw new Error('parametr "data" must be not empty!');
          } else{
            _data = params.data;
          }

          if(!params.selfElemSelector){
              throw new Error('parametr "selfElemSelector" must be not empty!');
          } else{
            _selfElemSelector = params.selfElemSelector;
          }

          if(!params.parentElemSelector){
              throw new Error('parametr "parentElemSelector" must be not empty!');
          } else{
            _parentElemSelector = params.parentElemSelector;
          }

        } catch (e) {
            console.error(e.name + ': ' + 'FrontEndValidator: ' + e.message);
        }


        self.debug = params.debug;
        self.timeDirection = params.timeDirection || 400;
        self.selfElem = document.querySelector(_selfElemSelector);
        self.inputs = document.querySelectorAll(_parentElemSelector + " [name]");
        _parentElements = document.querySelectorAll(_parentElemSelector);

        applyEvents();
    };

    // end INIT ----------------------------------------



    // EVENTS ------------------------------------------

    function applyEvents() {
        Array.prototype.forEach.call(_data, function(item) {
            item.name = [].concat(item.name);
            item.pattern = item.pattern || "[^\s]{1,}";

            Array.prototype.forEach.call(item.name, function(name){
                getInput(name, function() {
                    var parrentElem = closest(this, _parentElemSelector);
                    var errorElem = parrentElem.querySelector('.error-elem');
                    var timer;
                    var _this = this;

                    if(!errorElem){
                        errorElem = document.createElement('div');
                        errorElem.classList.add('error-elem');
                        errorElem.classList.add('hidden');
                        errorElem.innerHTML = item.message;
                        parrentElem.insertBefore(errorElem, parrentElem.querySelector(':first-child'));
                    }

                    this.addEventListener('keyup', function(e) {
                        clearTimeout(timer);
                        timer = setTimeout(function(){
                            checkInput(_this, item, name);
                        }, self.timeDirection);

                    });

                    this.addEventListener('change', function(e) {
                        clearTimeout(timer);
                        timer = setTimeout(function(){
                            checkInput(_this, item, name);
                        }, self.timeDirection);
                    });
                });
            });
        });
    };

    // end EVENTS --------------------------------------



    // METHODS -----------------------------------------

    this.isValid = function(){
        _valid = true;

        Array.prototype.forEach.call(_data, function(item) {
            Array.prototype.forEach.call(item.name, function(name){

                var input = getInput(name);
                if(input && !checkInput(input, item, name)){
                    _valid = false;
                }
            });
        });

        return _valid;
    }

    // end METHODS -------------------------------------



    // PRIVATE METHODS ---------------------------------

    function getInput(name, callback){
        callback = callback || function() {};

        try {

            var input = self.selfElem.querySelector('[name="' + name + '"]');

            if(!input){
                if(self.debug){
                    throw new Error('input with name "' + name + '" not found!');
                }
                return undefined;
            }

            callback.call(input);

        } catch (e) {
            console.error(e.name + ': ' + 'FrontEndValidator: ' + e.message);
        }
        return input;
    };



    function checkInput(input, itemData, name) {
        var parrentElem = closest(input, _parentElemSelector);
        var errorElem = parrentElem.querySelector('.error-elem');

        var patt = new RegExp(itemData.pattern);
        var valid = true;

        if(input.name == "select-box"){
            if( !input.isValid() ){
                valid = false;
            }
        } else if(input.type == "radio" || input.type == "checkbox"){
            if(self.selfElem.querySelector('[name="' + name + '"]:checked').length < itemData.pattern){
                valid = false;
            }
        } else if( !patt.test(input.value) ) {
            valid = false;
        }

        if(valid){
            input.classList.remove('error');
            errorElem.classList.add('hidden');
        } else {
            input.classList.add('error');
            errorElem.classList.remove('hidden');
        }
    };

    // end PRIVATE METHODS -----------------------------



    init(params);



    return this;
}

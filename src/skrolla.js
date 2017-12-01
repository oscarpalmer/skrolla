((scope) => {

  const
  //  Document for 'scope'
  doc = scope.document,

  //  References for smarter math functions
  ceiling = Math.ceil,
  powerOf = Math.pow,

  //  Reference for smarter object functions
  objectPrototype = Object.prototype,

  //  Options for Skrolla
  options = {
    callback: null,
    offset: 0
  },

  /**
   *  Add listeners to the appropriate elements.
   */
  addListeners = () => {

    const
    //  Elements that are Skrolla-friendly
    elements = doc.querySelectorAll("[data-skrolla]");

    //  Add an event listener for each element
    Array.prototype.forEach.call(elements, (element) => {
      element.addEventListener("click", onClick);
    });

  },

  /**
   *  easeInOutQuad-easing function for nice animations.
   *
   *  Thanks, Benjamin; github.com/bendc/animateplus
   *
   *  @param  {Float} time - Value for calculations
   *  @return {Float}        Calculated value
   */
  easing = (time) => {
    if ((time *= 2) < 1) {
      return .5 * powerOf(time, 3);
    }

    return .5 * ((time -= 2) * powerOf(time, 2) + 2);
  },

  /**
   *  Get the duration for a single animation.
   *
   *  Distance can be negative, but duration cannot,
   *  so let's make it positive. A positive distance might
   *  still be float-y, so let's get its nearest greater integer.
   *  After all that, we'll return it.
   *
   *  @param  {Number} distance - Distance to scroll
   *  @return {Number}            Duration of scroll
   */
  getDuration = (distance) => ceiling(distance < 1 ? -distance : distance),

  /**
   *  Get an element based on an ID,
   *  or the document body if that's not possible.
   *
   *  @param  {String}  id - ID for element
   *  @return {Element}      Found element
   */
  getElement = (id) => doc.getElementById(id) || doc.body,

  /**
   *  Get the offset value of an element.
   *
   *  @param  {Element} element - Element to inspect
   *  @return {Number}            Offset value
   */
  getOffset = (element) => element.getBoundingClientRect().top - options.offset,

  /**
   *  Get the target element for a specific scroll.
   *
   *  @param  {Element|String} target - ID for, or an actual element
   *  @return {Element}                 Found element
   */
  getTarget = (target) => {

    //  The target is already an element,
    //  so let's just return it
    if (target.nodeType) {
      return target;
    }

    //  Call 'getElement' if it's a string and return its value,
    //  or return the document body if the target is invalid
    return typeof target === "string" ? getElement(target) : doc.body;

  },

  /**
   *  The handler for click events added to elements in 'addListeners'.
   *
   *  @param {Event} event - Event details for a unique element
   */
  onClick = (event) => {

    //  Prevent unneseccary events, like those for anchors
    event.preventDefault();

    const
    //  Get the target of the event
    {target} = event,

    //  Get the value of the 'data-skrolla'-attribute on the target
    targetId = target.getAttribute("data-skrolla");

    //  Call 'scrollTo' with both the targeted value and the event target
    skrollTo(targetId, target);
  },

  /**
   *  Override the default options with ones supplied by the user.
   *
   *  @param {Object} object - Object of options
   */
  setOptions = (object) => {

    //  Bad options, so let's not do anything with it
    if (objectPrototype.toString.call(object) !== "[object Object]") {
      return;
    }

    //  For each option, override its counterpart in the default options
    for (const property in object) {
      if (objectPrototype.hasOwnProperty.call(object, property)) {
        options[property] = object[property];
      }
    }

    //  If the user added a 'callback', we'll tell Skrolla about it
    if (typeof options.callback === "function") {
      skrollaCallback = true;
    }

  },

  /**
   *  The actual scrolling function for Skrolla.
   *
   *  Called by both event handlers and 'skrolla.to';
   *
   *  @param {Element|String} target - ID for, or element to scroll to
   *  @param {Element|Window} origin - Origin element or 'window'
   */
  skrollTo = (target, origin) => {

    const
    //  Offset for the page
    page     = scope.pageYOffset,

    //  Target element for the scroll
    element  = getTarget(target),

    //  Offset for the target element
    offset   = getOffset(element),

    //  Duration for the scroll
    duration = getDuration(offset),

    /**
     *  Looped function for the scroll.
     *
     *  @param {Float} time - Current time
     */
    loop = (time)  => {

      //  First loop? Set the starting time
      if (start === null) {
        start = time;
      }

      const
      //  Elapsed time for the animation
      elapsed  = time - start,

      //  Distance to cover during this incremental scroll
      distance = offset * easing(elapsed / duration);

      //  Scroll to a specific position
      scope.scrollTo(0, page + distance);

      if (elapsed < duration) {

        //  Animation and scrolling hasn't finished,
        //  so let's call rFA to work its magic again
        scope.requestAnimationFrame(loop);

      } else {

        //  If the user added a callback, we'll call
        //  it now that the scrolling has finished
        if (skrollaCallback) {
          options.callback.call(element, element, origin);
        }

      }
    };

    let
    //  Start value for the animation,
    //  to be overriden with the start of the first loop
    start = null;

    //  Call rFA with our 'loop'-function
    scope.requestAnimationFrame(loop);
  };

  let

  //  Skrolla is not active by default.
  skrollaActive = false,

  //  Skrolla does not have a callback by default.
  skrollaCallback = false;

  /**
   *  Global method to activate Skrolla.
   *
   *  @param {Object} userOptions - Options supplied by the user
   */
  scope.skrolla = (userOptions) => {

    //  If Skrolla is already active,
    //  it should not be possible to active it again
    if (skrollaActive) {
      return;
    }

    //  Set Skrolla to be active
    skrollaActive = true;

    //  Override the default options
    setOptions(userOptions);

    //  Add event listeners to appropriate elements
    addListeners();

  };

  /**
   *  Global method to directly scroll to an element.
   *
   *  @param {Element|String} target - ID for, or an existing element
   */
  scope.skrolla.to = (target) => {

    //  Call 'skrollTo' with the target and 'scope' as parameters
    skrollTo(target, scope);

  };
})(window);

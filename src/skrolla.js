((scope) => {
  const
  doc  = scope.document,
  one  = 1,
  zero = 0,
  objectPrototype = Object.prototype,
  options = {
    "callback": null,
    "offset": 0
  },

  addListeners = () => {
    const
    elements = doc.querySelectorAll("[data-skrolla]");

    Array.prototype.forEach.call(elements, (element) => {
      element.addEventListener("click", onClick);
    });
  },

  easing = (time) => {
    if ((time *= 2) < 1) {
      return .5 * time ** 3;
    } else {
      return .5 * ((time -= 2) * time ** 2 + 2);
    }
  },

  getDuration = (distance) => Math.ceil(distance < one ? -distance : distance),

  getElement = (target) => doc.getElementById(target) || doc.body,

  getOffset = (element) => element.getBoundingClientRect().top - options.offset,

  getTarget = (target) => {
    if (target.nodeType) {
      return target;
    }

    return typeof target === "string" ? getElement(target) : doc.body;
  },

  onClick = (event) => {
    event.preventDefault();

    const
    {target} = event,
    targetId = target.dataset.skrolla;

    skrollTo(targetId, target);
  },

  setOptions = (object) => {
    if (objectPrototype.toString.call(object) !== "[object Object]") {
      return;
    }

    for (const property in object) {
      if (objectPrototype.hasOwnProperty.call(object, property)) {
        options[property] = object[property];
      }
    }

    if (typeof options.callback === "function") {
      skrollaCallback = true;
    }
  },

  skrollTo = (target, origin) => {
    const
    page     = scope.pageYOffset,
    element  = getTarget(target),
    offset   = getOffset(element),
    duration = getDuration(offset),

    loop = (time)  => {
      if (start === null) {
        start = time;
      }

      const
      elapsed  = time - start,
      distance = offset * easing(elapsed / duration);

      scope.scrollTo(zero, page + distance);

      if (elapsed < duration) {
        scope.requestAnimationFrame(loop);
      } else {
        scope.scrollTo(zero, page + offset);
        if (skrollaCallback) {
          options.callback.call(element, element, origin);
        }
      }
    };

    let
    start = null;

    scope.requestAnimationFrame(loop);
  };

  let
  skrollaActive = false,
  skrollaCallback = false;

  scope.skrolla = (userOptions) => {
    if (skrollaActive) {
      return;
    }

    skrollaActive = true;

    setOptions(userOptions);

    addListeners();
  };

  scope.skrolla.to = (target) => {
    skrollTo(target, scope);
  };
})(window);

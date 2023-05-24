//Validator Object
function Validator(options) {
    function getParentElement(element, selector) {
        return element.closest(selector);
    }

    var selectorRules = {};

    function handleValidate(inputElement, rule) {
        var errorMessage;
        var errorElement = getParentElement(
            inputElement,
            options.formGroupSelector
        ).querySelector(options.errorSelector);

        var rules = selectorRules[rule.selector];

        //check each rule, if error -> break
        for (var ruleItem of rules) {
            switch (inputElement.type) {
                case "checkbox":
                // errorMessage = ruleItem(inputElement.value);
                // break;
                case "radio":
                    errorMessage = ruleItem(
                        formElement.querySelector(rule.selector + ":checked")
                    );
                    break;
                default:
                    errorMessage = ruleItem(inputElement.value);
            }

            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParentElement(
                inputElement,
                options.formGroupSelector
            ).classList.add("invalid");
        } else {
            errorElement.innerText = "";
            getParentElement(
                inputElement,
                options.formGroupSelector
            ).classList.remove("invalid");
        }

        //return boolean if error
        return !errorMessage;
    }

    var formElement = document.querySelector(options.form);

    if (formElement) {
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            //validate on submit
            options.rules.forEach(function (rule) {
                var inputElement = document.querySelector(rule.selector);
                var isValid = handleValidate(inputElement, rule);

                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                //submit with JavaScript
                if (typeof options.onSubmit === "function") {
                    options.onSubmit("0 có lỗi");

                    var enableInputs = formElement.querySelectorAll(
                        "[name]:not([disabled])"
                    );
                    var formValues = Array.from(enableInputs).reduce(function (
                        values,
                        input
                    ) {
                        switch (input.type) {
                            case "radio":
                                if (!input.matches(":checked")) {
                                    values[input.name] = "";
                                    return values;
                                }
                                values[input.name] = formElement.querySelector(
                                    "input[name='" + input.name + "']:checked"
                                ).value;
                                break;
                            case "checkbox":
                                if (!input.matches(":checked")) return values;
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case "file":
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }

                        return values;
                    },
                    {});
                    console.log(formValues);
                }
                //submit with original HTML submit event
                else {
                    formElement.submit();
                }
            }
        };

        options.rules.forEach(function (rule) {
            //save rules of each input element
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = document.querySelectorAll(rule.selector);

            inputElements.forEach(function (inputElement) {
                inputElement.onblur = function () {
                    handleValidate(inputElement, rule);
                };

                inputElement.oninput = function () {
                    var errorElement = getParentElement(
                        inputElement,
                        options.formGroupSelector
                    ).querySelector(options.errorSelector);

                    errorElement.innerText = "";
                    getParentElement(
                        inputElement,
                        options.formGroupSelector
                    ).classList.remove("invalid");
                };
            });
        });
    }
}

//Define rules
//on error: return error message
//on success: return undefined
Validator.isRequired = function (selector, message) {
    return {
        selector,
        test: function (value) {
            return value ? undefined : message || "Vui lòng nhập trường này";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value)
                ? undefined
                : message || "Trường này phải là email";
        },
    };
};

Validator.minLength = function (selector, min = 6, message) {
    return {
        selector,
        test: function (value) {
            return value.length >= min
                ? undefined
                : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        },
    };
};
Validator.isConfirmed = function (selector, getConfirmedValue, message) {
    return {
        selector,
        test: function (value) {
            return value === getConfirmedValue()
                ? undefined
                : message || "Giá trị nhập vào không chính xác";
        },
    };
};

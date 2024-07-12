(function ($) {
    let $self = null;

    const Index = function () {
        $self = this;
    }

    Index.prototype = {
        init() {
            $("#J_input").on("input", $self.triggerChange);
            $("#J_copyPhpCode").on("click", $self.copyPhpCode);
        },

        copyPhpCode() {
            let phpCode = $self.getPhpCode();
            if (phpCode.length > 0) {
                navigator.clipboard.writeText(phpCode);
            }
        },

        triggerChange() {
            $("#J_phpCode").html($self.getPhpCode());
        },

        getPhpCode() {
            let json = $self.getJsonByInput();
            if (!json) {
               return "";
            } else {
                let phpCode = $self.jsonToPhp(json);
                return "$array = " + phpCode + ";";
            }
        },

        parseQueryToJson(input) {
            let  oneLevelObj = Object.fromEntries(new URLSearchParams(input))

            let json = {};
            for (let key in oneLevelObj) {
                let value = json[key];
                let keyPath = key.split("[");
                for (let index in keyPath) {
                    keyPath[index] = keyPath[index].replace(/]+$/g, '')
                }

                let pointer = json;
                for (let index = 0; index < keyPath.length; index++) {
                    let isLast = keyPath.length === (parseInt(index) + 1);
                    let key = keyPath[index];
                    if (isLast) {
                        pointer[key] = value;
                    } else if (Object.keys(pointer).indexOf(key) !== -1) {
                        pointer = pointer[key];
                    } else {
                        let nextKey = keyPath[index + 1];
                        if (nextKey === "0") {
                            pointer[key] = [];
                        } else {
                            pointer[key] = {};
                        }
                        pointer = pointer[key];
                    }
                }
            }

            return json;
        },

        getJsonByInput() {
            let input = $("#J_input").val().trim();
            if (input.length < 1) {
                return null;
            }

            if (input[0] === '[' || input[0] === '{') {
                try {
                    let json = JSON.parse(input);
                    if (json) {
                        return json;
                    }
                } catch (e) {}
            }

            return $self.parseQueryToJson(input);
        },

        getSpace(level) {
            let space = ""
            for (let i = 0; i < level; i++) {
                space += "    ";
            }

            return space;
        },

        jsonToPhp(json, level = 1) {
            let codeList = [];
            let isArray = json instanceof Array;
            for (const key in json) {
                let value = json[key];
                let code = "";
                if (value instanceof Object || value instanceof Array) {
                    code = $self.jsonToPhp(value, level + 1);
                } else {
                    code = `"${value}"`;
                }

                if (isArray) {
                    codeList.push(`${code},`);
                } else {
                    codeList.push(`"${key}" => ${code},`);
                }
            }

            let space = this.getSpace(level);
            let spacePre = this.getSpace(level - 1);
            let code = codeList.join("\r\n" + space);
            return `[\r\n${space}${code}\r\n${spacePre}]`;
        }
    };

    const obj = new Index();
    obj.init();
})($);



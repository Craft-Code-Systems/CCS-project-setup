import globals from 'globals'; // Import known global functions

// Declare built-in class names outside of the rules object
const jsBuiltInClasses = ['Array', 'Object', 'HTMLElement', 'Promise', 'Date', 'Error', 'String']; // JavaScript built-in classes
const svelteBuiltInClasses = ['SvelteComponent']; // Svelte built-in classes
const svelteBuiltInFunctions = ['onMount', 'beforeUpdate', 'afterUpdate', 'onDestroy']; // Svelte built-in functions

function isSnakeCase(name) {
  return /^[a-z]+(_[a-z]+)*$/.test(name);
}

export const rules = {
'uppercase-const': {
  meta: {
    type: "suggestion",
    docs: {
      description: "require const variables to be in uppercase",
      category: "Stylistic Issues",
      recommended: false,
    },
    schema: [],
    messages: {
      uppercaseConst: "Const '{{name}}' should be in uppercase.",
    },
  },
  create(context) {
    return {
      VariableDeclaration(node) {
        if (node.kind === "const") {
          node.declarations.forEach((declaration) => {
            // Check if declaration.id and declaration.id.name exist
            if (declaration.id && declaration.id.name) {
              const variableName = declaration.id.name;
              if (typeof variableName === 'string' && variableName !== variableName.toUpperCase()) {
                context.report({
                  node: declaration.id,
                  messageId: "uppercaseConst",
                  data: {
                    name: variableName,
                  },
                });
              }
            }
          });
        }
      },
    };
  },
},
'no-camelcase': {
  meta: {
    type: "suggestion",
    docs: {
      description: "disallow camelCase variable names and enforce snake_case, except for objects, constants, functions, and certain patterns",
      category: "Stylistic Issues",
      recommended: false,
    },
    schema: [],
    messages: {
      noCamelCase: "Variable '{{name}}' should be in snake_case.",
    },
  },
  create(context) {
    const globalVariables = new Set(Object.keys(globals.browser).concat(Object.keys(globals.es2021)));

    function isGlobalObjectMethod(node) {
      // Check if the identifier is part of a MemberExpression (e.g., Date.getMonth)
      if (node.parent && node.parent.type === 'MemberExpression' && node.parent.object) {
        const objectName = node.parent.object.name;
        // If the object is a global object (e.g., Date, Array), ignore its methods
        return globalVariables.has(objectName);
      }
      return false;
    }

    function isGlobalVariable(variableName) {
      const sourceCode = context.getSourceCode();
      const scope = sourceCode.scopeManager.globalScope;

      if (!scope) {
        return false; // No global scope found
      }

      // Check if the variable is in the global scope
      return scope.variables.some(variable => variable.name === variableName);
    }

    return {
      Identifier(node) {
        const variableName = node.name;
        const parent = node.parent;

        // Ignore global variables (e.g., Date, Array) or methods of global objects (e.g., Date.getMonth)
        if (globalVariables.has(variableName) || isGlobalObjectMethod(node) || isGlobalVariable(variableName)) {
          return;
        }

        // Ignore allowed patterns like 'f_' or PascalCase ending in '_m'
        const isAllowedPattern = /^f_[a-z][a-zA-Z0-9]*$/.test(variableName) || /^[A-Z][a-zA-Z0-9]*_m$/.test(variableName);
        if (isAllowedPattern) {
          return;
        }

        // Ignore functions, properties, and constants
        if (
          parent.type === 'FunctionDeclaration' ||
          parent.type === 'FunctionExpression' ||
          parent.type === 'ArrowFunctionExpression' ||
          (parent.type === 'Property' && parent.key === node && parent.parent.type === 'ObjectExpression') ||
          variableName === variableName.toUpperCase()
        ) {
          return;
        }

        // Check variable names that are not functions, properties, constants, or globals
        if (!isSnakeCase(variableName)) {
          context.report({
            node: node,
            messageId: "noCamelCase",
            data: {
              name: variableName,
            },
          });
        }
      },
    };
  },
},

'function-max-lines': {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'warn if a function is longer than 30 lines',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [],
    messages: {
      functionTooLong: "Function '{{name}}' is too long ({{lineCount}} lines excluding blank lines and comments). Consider refactoring.",
    },
  },
  create(context) {
    const sourceCode = context.getSourceCode(); // Get the source code to analyze comments

    function countNonBlankNonCommentLines(node) {
      const lines = sourceCode.getText(node).split('\n');
      const nonBlankNonCommentLines = lines.filter((line) => {
        const trimmedLine = line.trim();
        return (
          trimmedLine.length > 0 && // Not a blank line
          !trimmedLine.startsWith('//') && // Not a single-line comment
          !/^\s*\/\*/.test(trimmedLine) && // Not the start of a block comment
          !/\*\//.test(trimmedLine) // Not the end of a block comment
        );
      });
      return nonBlankNonCommentLines.length;
    }

    function checkFunctionLength(node, functionName) {
      const lineCount = countNonBlankNonCommentLines(node);
      if (lineCount > 30) {
        context.report({
          node,
          messageId: 'functionTooLong',
          data: {
            name: functionName || '(anonymous)',
            lineCount,
          },
        });
      }
    }

    return {
      FunctionDeclaration(node) {
        checkFunctionLength(node, node.id.name);
      },
      FunctionExpression(node) {
        const functionName = node.id && node.id.name ? node.id.name : '(anonymous)';
        checkFunctionLength(node, functionName);
      },
      ArrowFunctionExpression(node) {
        let functionName = '(anonymous)';
        if (node.parent.type === 'VariableDeclarator' && node.parent.id && node.parent.id.name) {
          functionName = node.parent.id.name;
        }
        checkFunctionLength(node, functionName);
      },
    };
  },
},
'function-require-comment': {
    meta: {
      type: "suggestion",
      docs: {
        description: "warn if a function does not have a comment directly above it",
        category: "Best Practices",
        recommended: false,
      },
      schema: [],
      messages: {
        missingComment: "Function '{{name}}' is missing a comment above it.",
      },
    },
    create(context) {
      const sourceCode = context.getSourceCode();

      function hasCommentDirectlyAbove(node) {
        const comments = sourceCode.getCommentsBefore(node);

        if (comments.length === 0) {
          console.log(`No comments found before function ${node.id ? node.id.name : '(anonymous)'}`);
          return false;
        }

        // Get the last comment (closest to the node)
        const lastComment = comments[comments.length - 1];
        console.log(`Last comment ends at line ${lastComment.loc.end.line}, function starts at line ${node.loc.start.line}`);

        // Ensure the comment ends immediately before the function starts
        const isDirectlyAbove = lastComment.loc.end.line === node.loc.start.line - 1;

        if (!isDirectlyAbove) {
          console.log(`Comment is not directly above the function ${node.id ? node.id.name : '(anonymous)'}`);
        }

        return isDirectlyAbove;
      }

      return {
        FunctionDeclaration(node) {
          if (!hasCommentDirectlyAbove(node)) {
            context.report({
              node,
              messageId: "missingComment",
              data: {
                name: node.id.name,
              },
            });
          }
        },
        FunctionExpression(node) {
          if (!hasCommentDirectlyAbove(node) && node.id && node.id.name) {
            context.report({
              node,
              messageId: "missingComment",
              data: {
                name: node.id.name,
              },
            });
          }
        },
        ArrowFunctionExpression(node) {
          let functionName = "(anonymous arrow function)";
          if (node.parent.type === 'VariableDeclarator' && node.parent.id && node.parent.id.name) {
            functionName = node.parent.id.name;
          }
          if (!hasCommentDirectlyAbove(node)) {
            context.report({
              node,
              messageId: "missingComment",
              data: {
                name: functionName,
              },
            });
          }
        },
      };
    },
  },
'function-naming-convention': {
    meta: {
      type: "suggestion",
      docs: {
        description: "enforce function names to start with 'f_' and follow camelCase, with exceptions for built-in JS and Svelte functions",
      },
      schema: [],
      messages: {
        invalidFunctionName: "Function '{{name}}' does not follow the naming convention 'f_<camelCase>'.",
      },
    },
    create(context) {
      return {
        FunctionDeclaration(node) {
          const functionName = node.id.name;
          const validPattern = /^f_[a-z][a-zA-Z0-9]*$/; // Matches 'f_' followed by camelCase

          // Check for global JavaScript functions or Svelte built-in functions
          if (globals.browser[functionName] || svelteBuiltInFunctions.includes(functionName)) {
            return; // Ignore built-in functions
          }

          if (!validPattern.test(functionName)) {
            context.report({
              node: node.id,
              messageId: "invalidFunctionName",
              data: {
                name: functionName,
              },
            });
          }
        },
      };
    },
  },
  'class-naming-convention': {
    meta: {
      type: "suggestion",
      docs: {
        description: "enforce class names to start with PascalCase and end with '_m', with exceptions for built-in JS and Svelte classes",
      },
      schema: [],
      messages: {
        invalidClassName: "Class '{{name}}' does not follow the naming convention 'PascalCase_m'.",
      },
    },
    create(context) {
      return {
        ClassDeclaration(node) {
          const className = node.id.name;
          const validPattern = /^[A-Z][a-zA-Z0-9]*_m$/; // Matches PascalCase followed by '_m'

          // Check for global JS or Svelte built-in classes
          if (jsBuiltInClasses.includes(className) || svelteBuiltInClasses.includes(className) || globals.browser[className]) {
            return; // Ignore built-in classes
          }

          if (!validPattern.test(className)) {
            context.report({
              node: node.id,
              messageId: "invalidClassName",
              data: {
                name: className,
              },
            });
          }
        },
      };
    },
  },
};

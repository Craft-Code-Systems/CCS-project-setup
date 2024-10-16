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
        description: "disallow camelCase variable names and enforce snake_case, except for objects, constants, and functions",
        category: "Stylistic Issues",
        recommended: false,
      },
      schema: [],
      messages: {
        noCamelCase: "Variable '{{name}}' should be in snake_case.",
      },
    },
    create(context) {
      return {
        Identifier(node) {
          const parent = node.parent;
          const variableName = node.name;

          // Allow camelCase for function names
          if (
            parent.type === 'FunctionDeclaration' ||
            parent.type === 'FunctionExpression' ||
            parent.type === 'ArrowFunctionExpression'
          ) {
            return;
          }

          // Allow camelCase for object properties
          if (
            parent.type === 'Property' &&
            parent.key === node &&
            parent.parent &&
            parent.parent.type === 'ObjectExpression'
          ) {
            return;
          }

          // Allow constants that are uppercase
          if (variableName === variableName.toUpperCase()) {
            return;
          }

          // Check variable names that are not constants, functions, or object properties
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
      type: "suggestion",
      docs: {
        description: "warn if a function is longer than 30 lines",
        category: "Best Practices",
        recommended: false,
      },
      schema: [],
      messages: {
        functionTooLong: "Function '{{name}}' is too long ({{lineCount}} lines). Consider refactoring.",
      },
    },
    create(context) {
      function checkFunctionLength(node, functionName) {
        const lineCount = node.loc.end.line - node.loc.start.line;
        if (lineCount > 30) {
          context.report({
            node,
            messageId: "functionTooLong",
            data: {
              name: functionName || "(anonymous)",
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
          const functionName = node.id && node.id.name ? node.id.name : "(anonymous)";
          checkFunctionLength(node, functionName);
        },
        ArrowFunctionExpression(node) {
          let functionName = "(anonymous)";
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
};

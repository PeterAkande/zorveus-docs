import React from 'react';

function applyReplacements(text, replacements) {
  let result = text;
  for (const [target, replacement] of Object.entries(replacements)) {
    if (!replacement || replacement === target) continue;
    if (result.includes(target)) {
      result = result.replaceAll(target, replacement);
    }
  }
  return result;
}

function flattenText(node) {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (React.isValidElement(node)) {
    const props = /** @type {{ children?: import('react').ReactNode }} */ (node.props);
    return flattenText(props?.children);
  }
  return '';
}

function hasAnyTarget(text, replacements) {
  for (const [target, replacement] of Object.entries(replacements)) {
    if (replacement && replacement !== target && text.includes(target)) {
      return true;
    }
  }
  return false;
}

/**
 * Replace API key placeholders inside a React node tree.
 * Falls back to flattening a Shiki .line span only when a token was split across spans.
 * @param {import('react').ReactNode} node
 * @param {Record<string, string>} replacements
 * @returns {import('react').ReactNode}
 */
export function replaceKeysInNode(node, replacements) {
  if (typeof node === 'string') {
    return applyReplacements(node, replacements);
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const replaced = replaceKeysInNode(child, replacements);
      if (React.isValidElement(replaced) && !replaced.key) {
        return React.cloneElement(replaced, { key: index });
      }
      return replaced;
    });
  }

  if (!React.isValidElement(node)) {
    return node;
  }

  const props = /** @type {{ className?: string; children?: import('react').ReactNode }} */ (node.props);
  if (!props?.children) {
    return node;
  }

  const nextChildren = replaceKeysInNode(props.children, replacements);
  const className = typeof props.className === 'string' ? props.className : '';
  const isCodeLine = className.split(/\s+/).includes('line');

  if (isCodeLine) {
    const lineText = flattenText(nextChildren);
    if (hasAnyTarget(lineText, replacements)) {
      return React.cloneElement(node, undefined, applyReplacements(lineText, replacements));
    }
  }

  return React.cloneElement(node, undefined, nextChildren);
}


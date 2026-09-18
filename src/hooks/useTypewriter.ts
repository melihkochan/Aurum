import { useState, useEffect } from 'react';

export function useTypewriter(
  words: string[],
  typingSpeed = 90,
  deletingSpeed = 45,
  pauseMs = 1800
): string {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    // Word completed, pause before deleting
    if (!isDeleting && subIndex === words[index].length) {
      const timeout = setTimeout(() => setIsDeleting(true), pauseMs);
      return () => clearTimeout(timeout);
    }

    // Word fully deleted, move to next word
    if (isDeleting && subIndex === 0) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      },
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting, words, typingSpeed, deletingSpeed, pauseMs]);

  if (!words || words.length === 0) return '';
  return words[index].substring(0, subIndex);
}

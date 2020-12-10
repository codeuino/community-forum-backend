module.exports.findUniqueTags = (tagString) => {
  let tagStringArray = tagString.trim().split(" ");
  let newTagStringArray = [];
  let newTagStringArrayLength = 0;
  tagStringArray.forEach((tagElement, index) => {
    const tagElementNoSpace = tagElement.trim();
    if (
      !tagElementNoSpace.match(`/^\s*$/`) &&
      tagElementNoSpace.length != 0
    ) {
      newTagStringArray[newTagStringArrayLength] =
        tagElementNoSpace[0].toUpperCase() +
        tagElementNoSpace.slice(1).toLowerCase();
        newTagStringArrayLength++;
    }
  });
  let uniqueTagStringArray = [...new Set(newTagStringArray)];
  return uniqueTagStringArray;
}

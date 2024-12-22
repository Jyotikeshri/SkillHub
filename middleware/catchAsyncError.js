export const catchError = (theFunc) => {
  return (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch(next); // Catch async errors and pass to next middleware
  };
};

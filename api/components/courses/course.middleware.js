module.exports = ({ catchAsync }) => {
    const self = {
      catchAsync,
    };

    const verifyParams = async (req, res, next) => {
        const filter =  req.params.professorId ? { professor:  req.params.professorId } : {};
        req.query = Object.assign(req.query, {...filter});
        return next();
    }

    const verifyBody = async (req, res, next) => {
        req.body.professor = req.body.professor || req.params?.professorId;
        return next();
    }

    const methods = (self) => ({
        verifyProfessorInParams: self.catchAsync(verifyParams),
        verifyProfessorInBody: self.catchAsync(verifyBody),
      });

    return methods(self);
}  
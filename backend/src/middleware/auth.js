import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: 'You must be signed in to do that.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (e) {
    const reason = e?.name === 'TokenExpiredError'
      ? 'Your session has expired — please sign in again.'
      : 'Your session is invalid — please sign in again.';
    return res.status(401).json({ message: reason });
  }
}

function formatRoles(roles) {
  if (roles.length === 1) return roles[0];
  if (roles.length === 2) return `${roles[0]} or ${roles[1]}`;
  return `${roles.slice(0, -1).join(', ')}, or ${roles[roles.length - 1]}`;
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!roles.length) return next();
    if (!req.user) {
      return res.status(401).json({ message: 'You must be signed in to do that.' });
    }
    if (!roles.includes(req.user.role)) {
      const need = formatRoles(roles);
      const article = /^[aeiou]/i.test(need) ? 'an' : 'a';
      return res.status(403).json({
        message: `You are not authorized to do that — please ask ${article} ${need} to do it.`,
      });
    }
    next();
  };
}

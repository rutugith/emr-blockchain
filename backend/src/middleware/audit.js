import AuditLog from '../models/AuditLog.js';

const RESOURCE_FROM_PATH = [
  { prefix: '/users', resource: 'user' },
  { prefix: '/patients', resource: 'patient' },
  { prefix: '/encounters', resource: 'encounter' },
  { prefix: '/auth', resource: 'auth' },
];

function resourceFor(path) {
  const hit = RESOURCE_FROM_PATH.find((r) => path.startsWith(r.prefix));
  return hit ? hit.resource : 'other';
}

function actionFor(method, path) {
  if (path.startsWith('/auth/login')) return 'login';
  if (path.startsWith('/auth/signup')) return 'signup';
  if (path.startsWith('/auth/change-password')) return 'change_password';
  switch (method) {
    case 'POST': return 'create';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return method.toLowerCase();
  }
}

export function auditMiddleware(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();

  const fullPath = req.originalUrl.split('?')[0];
  res.on('finish', () => {
    const log = {
      action: actionFor(req.method, fullPath),
      method: req.method,
      path: req.originalUrl,
      resource: resourceFor(fullPath),
      resourceId: req.params?.id || undefined,
      actorId: req.user?.userId,
      actorUsername: req.user?.username || req.body?.username,
      actorRole: req.user?.role,
      status: res.statusCode,
      ip: req.ip,
    };
    AuditLog.create(log).catch((e) => console.error('audit log failed:', e.message));
  });

  next();
}

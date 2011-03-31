from twisted.application import internet, service
from twisted.python import log

import fi.throttle
from fi.throttle.controller import ThrottleServerController
import fi.throttle.model

factory = ThrottleServerController()
factory.update()

application = service.Application("FreeInternet Throttle Server", uid=0, gid=0)
job_service = internet.TCPServer(fi.throttle.THROTTLE_PORT, factory)

job_service.setServiceParent(application)
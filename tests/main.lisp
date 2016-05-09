(in-package :cl-user)

(eval-when (:compile-toplevel :load-toplevel :execute)
  (ql:quickload '(selenium prove)))

(defpackage rogalia-test
  (:use :cl :selenium :selenium-utils :prove))

(in-package :rogalia-test)

(defparameter *root* "http://localhost/?server=localhost")
(setf selenium-utils:*timeout* 1)

(defmacro with-login ((&optional (login "Tester") (password "qwerty")) &body body)
  `(with-session ()
     (setf (url) *root*)
     (send-keys ,login)
     (send-key :tab)
     (send-keys ,password)
     (send-key :tab)
     (click)

     ,@body))

(plan nil)

(subtest "login-not-found"
  (with-login ((format nil "nonexistent~a" (random 100)))
    (is (text (wait-for ".popup-message")) "Not found")))

(finalize)

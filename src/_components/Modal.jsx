import React from 'react'


function Modal(props) {


  return (
      <div>
            <div className={`modal fade ${ (props.showModal) ? 'show' : ''}`} style={ {display: (props.showModal) ? 'block' : 'none'  } } tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{props.title}</h5>
                    <i className="bi-exclamation-diamond" role="button" aria-label="Warning"></i>
                    <button onClick={() => props.setShowModal(false)} type="button" className="btn-close" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
 
                    {props.children}

                  </div>
                </div>
              </div>
            </div>

                 <div className="modal-backdrop"></div>
      </div>           
  );
}

export { Modal };            

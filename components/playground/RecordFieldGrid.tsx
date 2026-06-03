export function RecordFieldGrid({ fields }: { fields: Array<[string, string | undefined]> }) {
    return (
        <section className="slds-theme_default">
            <div className="slds-grid slds-wrap slds-gutters_x-small">
                {fields.map(([label, value]) => (
                    <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2" key={label}>
                        <div className="slds-form-element slds-form-element_readonly slds-form-element_stacked slds-p-vertical_x-small slds-border_bottom">
                            <span className="slds-form-element__label">{label}</span>
                            <div className="slds-form-element__control">
                                <span className="slds-form-element__static">{value || "-"}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
